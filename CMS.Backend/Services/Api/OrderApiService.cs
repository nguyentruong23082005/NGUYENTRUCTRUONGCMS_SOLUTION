using CMS.Backend.Helpers;
using CMS.Backend.Models;
using CMS.Backend.Models.Dtos;
using CMS.Backend.Services.Shipping;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CMS.Backend.Services.Api
{
    public sealed class OrderApiService : IOrderApiService
    {
        private readonly ApplicationDbContext _db;
        private readonly IStockLockStrategy _stockLockStrategy;
        private readonly IVoucherApiService _voucherService;
        private readonly IGhnShippingService _shippingService;
        private readonly OrderPolicy _orderPolicy;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly ILogger<OrderApiService> _logger;

        public OrderApiService(
            ApplicationDbContext db,
            IStockLockStrategy stockLockStrategy,
            IVoucherApiService voucherService,
            IGhnShippingService shippingService,
            IOptions<OrderPolicy> orderPolicy,
            IConfiguration configuration,
            IEmailService emailService,
            ILogger<OrderApiService> logger)
        {
            _db = db;
            _stockLockStrategy = stockLockStrategy;
            _voucherService = voucherService;
            _shippingService = shippingService;
            _orderPolicy = orderPolicy.Value;
            _configuration = configuration;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<OrderDto> PlaceOrderAsync(int customerId, PlaceOrderDto dto, bool suppressEmail = false)
        {
            if (dto.Items == null || !dto.Items.Any())
            {
                throw new InvalidOperationException("Đơn hàng phải có ít nhất một sản phẩm.");
            }

            // 1. Xác định địa chỉ giao hàng
            string receiverName;
            string receiverPhone;
            string shippingAddress;

            if (dto.CustomerAddressId.HasValue)
            {
                var address = await _db.CustomerAddresses
                    .FirstOrDefaultAsync(a => a.Id == dto.CustomerAddressId.Value && a.CustomerId == customerId);
                if (address == null)
                {
                    throw new InvalidOperationException("Địa chỉ giao hàng mặc định không hợp lệ.");
                }

                receiverName = address.ReceiverName;
                receiverPhone = address.ReceiverPhone;
                shippingAddress = $"{address.AddressLine}, {address.Ward}, {address.District}, {address.Province}";
            }
            else
            {
                if (string.IsNullOrWhiteSpace(dto.ReceiverName) ||
                    string.IsNullOrWhiteSpace(dto.ReceiverPhone) ||
                    string.IsNullOrWhiteSpace(dto.ShippingAddress))
                {
                    throw new InvalidOperationException("Thông tin giao hàng (tên, điện thoại, địa chỉ) là bắt buộc nếu không chọn địa chỉ từ sổ địa chỉ.");
                }

                receiverName = dto.ReceiverName.Trim();
                receiverPhone = dto.ReceiverPhone.Trim();
                shippingAddress = dto.ShippingAddress.Trim();
            }

            // 2. Bắt đầu Transaction với mức cô lập RepeatableRead
            using var transaction = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.RepeatableRead);
            try
            {
                var orderDetails = new List<OrderDetail>();
                decimal subtotal = 0;

                // 3. Duyệt và khóa/trừ kho sản phẩm gốc cùng toppings
                foreach (var item in dto.Items)
                {
                    // Khóa và tải sản phẩm gốc bằng StockLockStrategy
                    var product = await _stockLockStrategy.LockProductAsync(item.ProductId);
                    if (product == null || product.IsDeleted)
                    {
                        throw new InvalidOperationException($"Sản phẩm với ID {item.ProductId} không tồn tại.");
                    }

                    if (product.StockQuantity < item.Quantity)
                    {
                        throw new InvalidOperationException($"Sản phẩm '{product.Name}' không đủ số lượng tồn kho (Tồn: {product.StockQuantity}, Yêu cầu: {item.Quantity}).");
                    }

                    // Khấu trừ kho sản phẩm gốc + cộng tổng đã bán
                    product.StockQuantity -= item.Quantity;
                    product.TotalSold += item.Quantity;

                    decimal basePrice = product.Price;
                    decimal toppingSurcharge = 0;
                    var detailOptions = new List<OrderDetailOption>();

                    // Khóa và tải các option toppings (nếu có)
                    if (item.OptionValueIds != null && item.OptionValueIds.Any())
                    {
                        foreach (var optValId in item.OptionValueIds)
                        {
                            var optVal = await _stockLockStrategy.LockOptionValueAsync(optValId);
                            if (optVal == null || optVal.IsDeleted || !optVal.IsActive)
                            {
                                throw new InvalidOperationException($"Tùy chọn topping với ID {optValId} không khả dụng.");
                            }

                            if (optVal.StockQuantity.HasValue)
                            {
                                if (optVal.StockQuantity.Value < item.Quantity)
                                {
                                    throw new InvalidOperationException($"Topping '{optVal.Name}' không đủ số lượng tồn kho (Tồn: {optVal.StockQuantity.Value}, Yêu cầu: {item.Quantity}).");
                                }

                                // Khấu trừ kho topping
                                optVal.StockQuantity = optVal.StockQuantity.Value - item.Quantity;
                            }

                            toppingSurcharge += optVal.PriceSurcharge;

                            detailOptions.Add(new OrderDetailOption
                            {
                                OptionValueId = optValId,
                                Price = optVal.PriceSurcharge
                            });
                        }
                    }

                    decimal unitPrice = basePrice + toppingSurcharge;
                    subtotal += unitPrice * item.Quantity;

                    var detail = new OrderDetail
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = unitPrice,
                        OrderDetailOptions = detailOptions
                    };

                    orderDetails.Add(detail);
                }

                // 4. Áp dụng Voucher (lock row trong transaction để tránh race condition)
                decimal discountAmount = 0;
                int? voucherId = null;

                if (!string.IsNullOrWhiteSpace(dto.VoucherCode))
                {
                    var codeUpper = dto.VoucherCode.Trim().ToUpper();

                    // UPDLOCK + ROWLOCK: chặn concurrent reads trên cùng row voucher
                    var voucher = await _db.Vouchers
                        .FromSqlRaw("SELECT * FROM Vouchers WITH (UPDLOCK, ROWLOCK) WHERE Code = {0}", codeUpper)
                        .FirstOrDefaultAsync();

                    if (voucher == null)
                        throw new InvalidOperationException("Mã giảm giá không tồn tại.");
                    if (!voucher.IsActive)
                        throw new InvalidOperationException("Mã giảm giá đã bị ngưng hoạt động.");
                    if (voucher.ExpiryDate < DateTime.Now)
                        throw new InvalidOperationException("Mã giảm giá đã hết hạn sử dụng.");

                    // Kiểm tra khách hàng đã dùng voucher này chưa (per-customer check)
                    var alreadyUsed = await _db.CustomerVouchers
                        .AnyAsync(cv => cv.CustomerId == customerId && cv.VoucherId == voucher.Id && cv.IsUsed);
                    if (alreadyUsed)
                        throw new InvalidOperationException("Bạn đã sử dụng mã giảm giá này rồi.");

                    if (subtotal < voucher.MinimumOrderAmount)
                        throw new InvalidOperationException($"Đơn hàng tối thiểu phải đạt {voucher.MinimumOrderAmount:N0}đ để áp dụng.");

                    // Tính discount
                    discountAmount = voucher.IsPercent
                        ? subtotal * (voucher.DiscountValue / 100)
                        : voucher.DiscountValue;
                    if (discountAmount > subtotal) discountAmount = subtotal;

                    voucherId = voucher.Id;

                    // Đánh dấu đã dùng (trong cùng transaction)
                    var customerVoucher = await _db.CustomerVouchers
                        .FirstOrDefaultAsync(cv => cv.CustomerId == customerId && cv.VoucherId == voucher.Id);

                    if (customerVoucher == null)
                    {
                        _db.CustomerVouchers.Add(new CustomerVoucher
                        {
                            CustomerId = customerId,
                            VoucherId = voucher.Id,
                            ClaimedAt = DateTime.UtcNow,
                            IsUsed = true,
                            UsedAt = DateTime.UtcNow
                        });
                    }
                    else
                    {
                        customerVoucher.IsUsed = true;
                        customerVoucher.UsedAt = DateTime.UtcNow;
                    }
                }

                decimal shippingFee = 0;
                int? shippingStoreId = dto.ShippingStoreId;

                if (!dto.IsPickup)
                {
                    var shippingResult = await CalculateTrustedShippingAsync(dto);
                    shippingFee = shippingResult.Fee;
                    shippingStoreId = shippingResult.NearestStoreId;
                }

                var totalAmount = subtotal - discountAmount + shippingFee;
                if (totalAmount < 0) totalAmount = 0;

                // 5. Lưu Order
                var order = new Order
                {
                    CustomerId = customerId,
                    VoucherId = voucherId,
                    Status = OrderStatus.Pending,
                    Notes = dto.Notes?.Trim(),
                    ReceiverName = receiverName,
                    ReceiverPhone = receiverPhone,
                    ShippingAddress = shippingAddress,
                    ShippingFee = shippingFee,
                    ShippingStoreId = shippingStoreId,
                    PaymentMethod = dto.PaymentMethod,
                    PaymentStatus = PaymentStatus.Pending,
                    DiscountAmount = discountAmount,
                    TotalAmount = totalAmount,
                    OrderDate = DateTime.Now,
                    OrderDetails = orderDetails
                };

                _db.Orders.Add(order);
                await _db.SaveChangesAsync();

                await transaction.CommitAsync();

                // Gửi email xác nhận đơn hàng (TC31, fire-and-forget, an toàn)
                // Chỉ gửi email nếu KHÔNG bị suppress (ví dụ: thanh toán online cần đợi payment URL thành công)
                if (!suppressEmail)
                {
                    var customer = await _db.Customers.FindAsync(customerId);
                    if (customer != null)
                    {
                        _ = _emailService.SendOrderConfirmationEmailAsync(
                            customer.Email, customer.FullName, order.Id, totalAmount, shippingAddress)
                            .ContinueWith(t => _logger.LogError(t.Exception,
                                "Lỗi gửi email đơn hàng #{OrderId} cho {Email}", order.Id, customer.Email),
                                TaskContinuationOptions.OnlyOnFaulted);
                    }
                }

                // Tải lại order đầy đủ quan hệ để map sang Dto trả về
                var savedOrder = await _db.Orders
                    .Include(o => o.OrderDetails)
                        .ThenInclude(od => od.Product)
                    .Include(o => o.OrderDetails)
                        .ThenInclude(od => od.OrderDetailOptions!)
                            .ThenInclude(odo => odo.OptionValue)
                    .FirstOrDefaultAsync(o => o.Id == order.Id);

                return MapToOrderDto(savedOrder!);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IReadOnlyCollection<OrderDto>> GetOrderHistoryAsync(int customerId, OrderHistoryQuery query)
        {
            var page = query.Page;
            var pageSize = query.PageSize;

            var dbQuery = _db.Orders
                .Where(o => o.CustomerId == customerId && !o.IsDeleted);

            if (!string.IsNullOrEmpty(query.Status))
            {
                var statusLower = query.Status.ToLower();
                if (statusLower == "pending")
                {
                    dbQuery = dbQuery.Where(o => o.Status == OrderStatus.Pending);
                }
                else if (statusLower == "confirmed")
                {
                    dbQuery = dbQuery.Where(o => o.Status == OrderStatus.Confirmed);
                }
                else if (statusLower == "preparing")
                {
                    dbQuery = dbQuery.Where(o => o.Status == OrderStatus.Preparing || o.Status == OrderStatus.Ready);
                }
                else if (statusLower == "outfordelivery")
                {
                    dbQuery = dbQuery.Where(o => o.Status == OrderStatus.OutForDelivery);
                }
                else if (statusLower == "completed")
                {
                    dbQuery = dbQuery.Where(o => o.Status == OrderStatus.Delivered || o.Status == OrderStatus.Completed);
                }
                else if (statusLower == "cancelled")
                {
                    dbQuery = dbQuery.Where(o => o.Status == OrderStatus.Cancelled);
                }
            }

            if (!string.IsNullOrEmpty(query.SearchKeyword))
            {
                var keyword = query.SearchKeyword.Trim().ToLower().Replace("#", "");
                if (int.TryParse(keyword, out int orderId))
                {
                    dbQuery = dbQuery.Where(o => o.Id == orderId);
                }
                else
                {
                    dbQuery = dbQuery.Where(o =>
                        (o.ReceiverName != null && o.ReceiverName.ToLower().Contains(keyword)) ||
                        (o.ReceiverPhone != null && o.ReceiverPhone.Contains(keyword)) ||
                        (o.ShippingAddress != null && o.ShippingAddress.ToLower().Contains(keyword))
                    );
                }
            }

            var orders = await dbQuery
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.OrderDetailOptions!)
                        .ThenInclude(odo => odo.OptionValue)
                .OrderByDescending(o => o.OrderDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return orders.Select(MapToOrderDto).ToList().AsReadOnly();
        }

        public async Task<OrderDto?> GetOrderDetailsAsync(int customerId, int orderId)
        {
            var order = await _db.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.OrderDetailOptions!)
                        .ThenInclude(odo => odo.OptionValue)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.CustomerId == customerId && !o.IsDeleted);

            if (order == null) return null;
            return MapToOrderDto(order);
        }

        public async Task<bool> CancelOrderAsync(int customerId, int orderId)
        {
            using var transaction = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.RepeatableRead);
            try
            {
                var order = await _db.Orders
                    .Include(o => o.OrderDetails)
                        .ThenInclude(od => od.OrderDetailOptions)
                    .FirstOrDefaultAsync(o => o.Id == orderId && o.CustomerId == customerId && !o.IsDeleted);

                if (order == null)
                {
                    throw new InvalidOperationException("Đơn hàng không tồn tại hoặc không thuộc về tài khoản này.");
                }

                // Kiểm tra trạng thái đơn hàng có được hủy hay không bằng OrderStatusHelper
                if (!OrderStatusHelper.CanCancel(order.Status))
                {
                    throw new InvalidOperationException($"Không thể hủy đơn hàng vì đơn đang ở trạng thái {OrderStatusHelper.GetDisplayName(order.Status)}.");
                }

                // Kiểm tra điều kiện hoàn voucher
                var now = DateTime.Now;
                bool isWithinWindow = order.OrderDate.AddMinutes(_orderPolicy.VoucherRefundWindowMinutes) >= now;
                bool canRefundVoucher = order.Status == OrderStatus.Pending && isWithinWindow;

                if (canRefundVoucher && order.VoucherId.HasValue)
                {
                    var cv = await _db.CustomerVouchers
                        .FirstOrDefaultAsync(x => x.CustomerId == customerId && x.VoucherId == order.VoucherId.Value);
                    if (cv != null)
                    {
                        cv.IsUsed = false;
                        cv.UsedAt = null;
                    }
                }

                // Cập nhật trạng thái thành Cancelled
                order.Status = OrderStatus.Cancelled;
                order.UpdatedAt = DateTime.UtcNow;

                // Hoàn trả tồn kho cho sản phẩm và topping
                foreach (var detail in order.OrderDetails)
                {
                    var product = await _stockLockStrategy.LockProductAsync(detail.ProductId);
                    if (product != null)
                    {
                        product.StockQuantity += detail.Quantity;
                        product.TotalSold = Math.Max(0, product.TotalSold - detail.Quantity);
                    }

                    if (detail.OrderDetailOptions != null)
                    {
                        foreach (var odo in detail.OrderDetailOptions)
                        {
                            var optVal = await _stockLockStrategy.LockOptionValueAsync(odo.OptionValueId);
                            if (optVal != null && optVal.StockQuantity.HasValue)
                            {
                                optVal.StockQuantity = optVal.StockQuantity.Value + detail.Quantity;
                            }
                        }
                    }
                }

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private static OrderDto MapToOrderDto(Order order)
        {
            return new OrderDto
            {
                Id = order.Id,
                OrderDate = order.OrderDate,
                Status = order.Status.ToString(),
                Notes = order.Notes,
                ReceiverName = order.ReceiverName,
                ReceiverPhone = order.ReceiverPhone,
                ShippingAddress = order.ShippingAddress,
                DiscountAmount = order.DiscountAmount,
                ShippingFee = order.ShippingFee,
                ShippingStoreId = order.ShippingStoreId,
                TotalAmount = order.TotalAmount,
                PaymentMethod = order.PaymentMethod.ToString(),
                PaymentStatus = order.PaymentStatus.ToString(),
                Items = order.OrderDetails.Select(od => new OrderDetailDto
                {
                    Id = od.Id,
                    ProductId = od.ProductId,
                    ProductName = od.Product != null ? od.Product.Name : "Sản phẩm đã bị xóa",
                    ProductImageUrl = od.Product != null ? od.Product.ImageUrl : null,
                    BasePrice = od.Product != null ? od.Product.Price : 0,
                    ToppingSurcharge = od.OrderDetailOptions != null ? od.OrderDetailOptions.Sum(odo => odo.Price) : 0,
                    UnitPrice = od.UnitPrice,
                    Quantity = od.Quantity,
                    TotalPrice = od.UnitPrice * od.Quantity,
                    Options = od.OrderDetailOptions != null ? od.OrderDetailOptions.Select(odo => new OrderDetailOptionDto
                    {
                        Id = odo.OptionValueId,
                        Name = odo.OptionValue != null ? odo.OptionValue.Name : "Topping đã bị xóa",
                        PriceSurcharge = odo.Price
                    }).ToList() : new List<OrderDetailOptionDto>()
                }).ToList()
            };
        }

        private async Task<ShippingFeeResult> CalculateTrustedShippingAsync(PlaceOrderDto dto)
        {
            if (!dto.GhnDistrictId.HasValue || string.IsNullOrWhiteSpace(dto.GhnWardCode))
            {
                throw new InvalidOperationException("Vui lòng chọn địa chỉ giao hàng có quận/huyện và phường/xã GHN hợp lệ để tính phí vận chuyển.");
            }

            var districtId = dto.GhnDistrictId.Value;
            var wardCode = dto.GhnWardCode.Trim();
            var defaultWeight = _configuration.GetValue<int>("GHN:DefaultWeight", 500);

            if (dto.ShippingStoreId.HasValue)
            {
                var storeExists = await _db.Stores.AnyAsync(s =>
                    s.Id == dto.ShippingStoreId.Value &&
                    !s.IsDeleted &&
                    s.GhnDistrictId.HasValue);

                if (!storeExists)
                {
                    _logger.LogWarning("Ignoring invalid shipping store hint {ShippingStoreId} during API checkout.", dto.ShippingStoreId.Value);
                }
            }

            var shippingResult = await _shippingService.CalculateBestFeeAsync(districtId, wardCode, defaultWeight, dto.ShippingStoreId);
            if (shippingResult.Fee <= 0)
            {
                _logger.LogWarning("GHN returned invalid shipping fee for DistrictId {DistrictId}, WardCode {WardCode}.", districtId, wardCode);
                throw new InvalidOperationException("Không thể tính phí vận chuyển, vui lòng thử lại sau hoặc chọn địa chỉ khác.");
            }

            return shippingResult;
        }

        public async Task RollbackOrderAsync(int orderId)
        {
            using var transaction = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.RepeatableRead);
            try
            {
                var order = await _db.Orders
                    .Include(o => o.OrderDetails)
                        .ThenInclude(od => od.OrderDetailOptions)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null) return;

                // 1. Hoàn trả voucher nếu có
                if (order.VoucherId.HasValue)
                {
                    var cv = await _db.CustomerVouchers
                        .FirstOrDefaultAsync(x => x.CustomerId == order.CustomerId && x.VoucherId == order.VoucherId.Value);
                    if (cv != null)
                    {
                        cv.IsUsed = false;
                        cv.UsedAt = null;
                    }
                }

                // 2. Hoàn trả tồn kho cho sản phẩm và topping
                foreach (var detail in order.OrderDetails)
                {
                    var product = await _stockLockStrategy.LockProductAsync(detail.ProductId);
                    if (product != null)
                    {
                        product.StockQuantity += detail.Quantity;
                        product.TotalSold = Math.Max(0, product.TotalSold - detail.Quantity);
                    }

                    if (detail.OrderDetailOptions != null)
                    {
                        foreach (var odo in detail.OrderDetailOptions)
                        {
                            var optVal = await _stockLockStrategy.LockOptionValueAsync(odo.OptionValueId);
                            if (optVal != null && optVal.StockQuantity.HasValue)
                            {
                                optVal.StockQuantity = optVal.StockQuantity.Value + detail.Quantity;
                            }
                        }
                    }
                }

                // 3. Xóa hẳn đơn hàng khỏi database
                _db.Orders.Remove(order);

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi rollback đơn hàng #{orderId}");
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
