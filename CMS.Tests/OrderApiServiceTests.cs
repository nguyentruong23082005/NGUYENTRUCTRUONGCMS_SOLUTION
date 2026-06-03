using CMS.Backend.Helpers;
using CMS.Backend.Models;
using CMS.Backend.Models.Dtos;
using CMS.Backend.Services.Api;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace CMS.Tests
{
    /// <summary>
    /// NOTE: The EF Core InMemory database provider used here is designed for testing EF Core code.
    /// It does NOT support transaction isolation levels (e.g. RepeatableRead) or pessimistic locking
    /// using raw SQL statements (e.g. SELECT WITH (UPDLOCK)). These mechanisms are bypassed in the tests.
    /// In a production environment running on SQL Server, SqlServerStockLockStrategy is injected
    /// and locks the appropriate database rows to prevent concurrent stock issues.
    /// </summary>
    public class OrderApiServiceTests
    {
        private ApplicationDbContext CreateInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(x => x.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
                .Options;
            return new ApplicationDbContext(options);
        }

        private IOptions<OrderPolicy> CreateOrderPolicyOptions(int minutes = 10)
        {
            var policy = new OrderPolicy { VoucherRefundWindowMinutes = minutes };
            return Options.Create(policy);
        }

        [Fact]
        public async Task PlaceOrderAsync_ValidRequest_StockDeducted_OrderPlaced()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var lockStrategy = new InMemoryStockLockStrategy(db);
            var voucherServiceMock = new Mock<IVoucherApiService>();
            var policyOptions = CreateOrderPolicyOptions();

            int customerId = 1;

            var product = new Product { Id = 10, Name = "Espresso", Price = 40000, StockQuantity = 20, Slug = "espresso" };
            var topping = new OptionValue { Id = 100, OptionGroupId = 2, Name = "Jelly", PriceSurcharge = 5000, StockQuantity = 15, IsActive = true };

            db.Products.Add(product);
            db.OptionValues.Add(topping);
            await db.SaveChangesAsync();

            var service = new OrderApiService(db, lockStrategy, voucherServiceMock.Object, policyOptions);

            var dto = new PlaceOrderDto
            {
                ReceiverName = "Nguyen Van A",
                ReceiverPhone = "0901234567",
                ShippingAddress = "123 St, HCM",
                Items = new List<OrderItemInputDto>
                {
                    new OrderItemInputDto
                    {
                        ProductId = product.Id,
                        Quantity = 2,
                        OptionValueIds = new List<int> { topping.Id }
                    }
                }
            };

            // Act
            var result = await service.PlaceOrderAsync(customerId, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Pending", result.Status);
            Assert.Equal(90000, result.TotalAmount); // (40000 base + 5000 topping) * 2 = 90000

            var pInDb = await db.Products.FindAsync(product.Id);
            Assert.Equal(18, pInDb!.StockQuantity); // 20 - 2

            var tInDb = await db.OptionValues.FindAsync(topping.Id);
            Assert.Equal(13, tInDb!.StockQuantity); // 15 - 2
        }

        [Fact]
        public async Task PlaceOrderAsync_InsufficientStock_ThrowsExceptionAndRollsBack()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var lockStrategy = new InMemoryStockLockStrategy(db);
            var voucherServiceMock = new Mock<IVoucherApiService>();
            var policyOptions = CreateOrderPolicyOptions();

            int customerId = 1;

            var product = new Product { Id = 10, Name = "Espresso", Price = 40000, StockQuantity = 1, Slug = "espresso" };
            db.Products.Add(product);
            await db.SaveChangesAsync();

            var service = new OrderApiService(db, lockStrategy, voucherServiceMock.Object, policyOptions);

            var dto = new PlaceOrderDto
            {
                ReceiverName = "Nguyen Van A",
                ReceiverPhone = "0901234567",
                ShippingAddress = "123 St, HCM",
                Items = new List<OrderItemInputDto>
                {
                    new OrderItemInputDto { ProductId = product.Id, Quantity = 2 }
                }
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.PlaceOrderAsync(customerId, dto));
            Assert.Contains("không đủ số lượng tồn kho", ex.Message);

            var pInDb = await db.Products.FindAsync(product.Id);
            Assert.Equal(1, pInDb!.StockQuantity); // Stock remains unchanged (rollback)
        }

        [Fact]
        public async Task PlaceOrderAsync_VoucherApplied_AppliesDiscount()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var lockStrategy = new InMemoryStockLockStrategy(db);
            var voucherServiceMock = new Mock<IVoucherApiService>();
            var policyOptions = CreateOrderPolicyOptions();

            int customerId = 1;
            var product = new Product { Id = 10, Name = "Espresso", Price = 40000, StockQuantity = 20, Slug = "espresso" };
            var voucher = new Voucher { Id = 5, Code = "SAVE10", IsActive = true, ExpiryDate = DateTime.Now.AddDays(5), DiscountValue = 10000 };
            
            db.Products.Add(product);
            db.Vouchers.Add(voucher);
            await db.SaveChangesAsync();

            voucherServiceMock.Setup(s => s.ValidateVoucherAsync("SAVE10", customerId, 40000))
                .ReturnsAsync(new VoucherValidationResultDto
                {
                    IsValid = true,
                    DiscountAmount = 10000,
                    Message = "Valid",
                    Voucher = new VoucherDto { Id = voucher.Id, Code = "SAVE10", DiscountValue = 10000 }
                });

            var service = new OrderApiService(db, lockStrategy, voucherServiceMock.Object, policyOptions);

            var dto = new PlaceOrderDto
            {
                ReceiverName = "Nguyen Van A",
                ReceiverPhone = "0901234567",
                ShippingAddress = "123 St, HCM",
                VoucherCode = "SAVE10",
                Items = new List<OrderItemInputDto>
                {
                    new OrderItemInputDto { ProductId = product.Id, Quantity = 1 }
                }
            };

            // Act
            var result = await service.PlaceOrderAsync(customerId, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(10000, result.DiscountAmount);
            Assert.Equal(30000, result.TotalAmount); // 40000 - 10000 = 30000

            var cv = await db.CustomerVouchers.FirstOrDefaultAsync(x => x.CustomerId == customerId && x.VoucherId == voucher.Id);
            Assert.NotNull(cv);
            Assert.True(cv.IsUsed);
        }

        [Fact]
        public async Task CancelOrderAsync_PendingWithinWindow_RestoresStockAndRefundsVoucher()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var lockStrategy = new InMemoryStockLockStrategy(db);
            var voucherServiceMock = new Mock<IVoucherApiService>();
            var policyOptions = CreateOrderPolicyOptions(10); // 10 minutes policy

            int customerId = 1;
            var product = new Product { Id = 10, Name = "Espresso", Price = 40000, StockQuantity = 10, Slug = "espresso" };
            var voucher = new Voucher { Id = 5, Code = "SAVE10", IsActive = true, ExpiryDate = DateTime.Now.AddDays(5), DiscountValue = 10000 };
            
            db.Products.Add(product);
            db.Vouchers.Add(voucher);
            await db.SaveChangesAsync();

            // Set up order created 2 minutes ago (within 10-minute policy window)
            var order = new Order
            {
                CustomerId = customerId,
                VoucherId = voucher.Id,
                Status = OrderStatus.Pending,
                OrderDate = DateTime.Now.AddMinutes(-2),
                DiscountAmount = 10000,
                TotalAmount = 30000
            };
            order.OrderDetails.Add(new OrderDetail { ProductId = product.Id, Quantity = 2, UnitPrice = 40000 });
            db.Orders.Add(order);

            var cv = new CustomerVoucher { CustomerId = customerId, VoucherId = voucher.Id, IsUsed = true, UsedAt = DateTime.UtcNow };
            db.CustomerVouchers.Add(cv);
            await db.SaveChangesAsync();

            var service = new OrderApiService(db, lockStrategy, voucherServiceMock.Object, policyOptions);

            // Act
            var success = await service.CancelOrderAsync(customerId, order.Id);

            // Assert
            Assert.True(success);

            var orderInDb = await db.Orders.FindAsync(order.Id);
            Assert.Equal(OrderStatus.Cancelled, orderInDb!.Status);

            var pInDb = await db.Products.FindAsync(product.Id);
            Assert.Equal(12, pInDb!.StockQuantity); // 10 + 2 restored

            var cvInDb = await db.CustomerVouchers.FirstOrDefaultAsync(x => x.CustomerId == customerId && x.VoucherId == voucher.Id);
            Assert.NotNull(cvInDb);
            Assert.False(cvInDb.IsUsed); // Voucher usage should be reset (refunded)
            Assert.Null(cvInDb.UsedAt);
        }

        [Fact]
        public async Task CancelOrderAsync_ConfirmedState_RestoresStockButDoesNotRefundVoucher()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var lockStrategy = new InMemoryStockLockStrategy(db);
            var voucherServiceMock = new Mock<IVoucherApiService>();
            var policyOptions = CreateOrderPolicyOptions(10);

            int customerId = 1;
            var product = new Product { Id = 10, Name = "Espresso", Price = 40000, StockQuantity = 10, Slug = "espresso" };
            var voucher = new Voucher { Id = 5, Code = "SAVE10", IsActive = true, ExpiryDate = DateTime.Now.AddDays(5), DiscountValue = 10000 };
            
            db.Products.Add(product);
            db.Vouchers.Add(voucher);
            await db.SaveChangesAsync();

            var order = new Order
            {
                CustomerId = customerId,
                VoucherId = voucher.Id,
                Status = OrderStatus.Confirmed, // Not Pending!
                OrderDate = DateTime.Now.AddMinutes(-2), // Within 10 min window
                DiscountAmount = 10000,
                TotalAmount = 30000
            };
            order.OrderDetails.Add(new OrderDetail { ProductId = product.Id, Quantity = 2, UnitPrice = 40000 });
            db.Orders.Add(order);

            var cv = new CustomerVoucher { CustomerId = customerId, VoucherId = voucher.Id, IsUsed = true, UsedAt = DateTime.UtcNow };
            db.CustomerVouchers.Add(cv);
            await db.SaveChangesAsync();

            var service = new OrderApiService(db, lockStrategy, voucherServiceMock.Object, policyOptions);

            // Act
            var success = await service.CancelOrderAsync(customerId, order.Id);

            // Assert
            Assert.True(success);

            var orderInDb = await db.Orders.FindAsync(order.Id);
            Assert.Equal(OrderStatus.Cancelled, orderInDb!.Status);

            var pInDb = await db.Products.FindAsync(product.Id);
            Assert.Equal(12, pInDb!.StockQuantity); // Stock restored

            var cvInDb = await db.CustomerVouchers.FirstOrDefaultAsync(x => x.CustomerId == customerId && x.VoucherId == voucher.Id);
            Assert.NotNull(cvInDb);
            Assert.True(cvInDb.IsUsed); // Voucher is NOT refunded because order was already Confirmed
        }

        [Fact]
        public async Task CancelOrderAsync_PendingOutsideWindow_RestoresStockButDoesNotRefundVoucher()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var lockStrategy = new InMemoryStockLockStrategy(db);
            var voucherServiceMock = new Mock<IVoucherApiService>();
            var policyOptions = CreateOrderPolicyOptions(10); // 10 minutes limit

            int customerId = 1;
            var product = new Product { Id = 10, Name = "Espresso", Price = 40000, StockQuantity = 10, Slug = "espresso" };
            var voucher = new Voucher { Id = 5, Code = "SAVE10", IsActive = true, ExpiryDate = DateTime.Now.AddDays(5), DiscountValue = 10000 };
            
            db.Products.Add(product);
            db.Vouchers.Add(voucher);
            await db.SaveChangesAsync();

            var order = new Order
            {
                CustomerId = customerId,
                VoucherId = voucher.Id,
                Status = OrderStatus.Pending,
                OrderDate = DateTime.Now.AddMinutes(-12), // 12 minutes ago (outside 10 min window)
                DiscountAmount = 10000,
                TotalAmount = 30000
            };
            order.OrderDetails.Add(new OrderDetail { ProductId = product.Id, Quantity = 2, UnitPrice = 40000 });
            db.Orders.Add(order);

            var cv = new CustomerVoucher { CustomerId = customerId, VoucherId = voucher.Id, IsUsed = true, UsedAt = DateTime.UtcNow };
            db.CustomerVouchers.Add(cv);
            await db.SaveChangesAsync();

            var service = new OrderApiService(db, lockStrategy, voucherServiceMock.Object, policyOptions);

            // Act
            var success = await service.CancelOrderAsync(customerId, order.Id);

            // Assert
            Assert.True(success);

            var cvInDb = await db.CustomerVouchers.FirstOrDefaultAsync(x => x.CustomerId == customerId && x.VoucherId == voucher.Id);
            Assert.NotNull(cvInDb);
            Assert.True(cvInDb.IsUsed); // Voucher is NOT refunded because it's outside the window
        }

        [Fact]
        public async Task CancelOrderAsync_DeliveredState_ThrowsException()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var lockStrategy = new InMemoryStockLockStrategy(db);
            var voucherServiceMock = new Mock<IVoucherApiService>();
            var policyOptions = CreateOrderPolicyOptions();

            int customerId = 1;
            var order = new Order
            {
                CustomerId = customerId,
                Status = OrderStatus.Delivered // Delivered orders cannot be cancelled
            };
            db.Orders.Add(order);
            await db.SaveChangesAsync();

            var service = new OrderApiService(db, lockStrategy, voucherServiceMock.Object, policyOptions);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.CancelOrderAsync(customerId, order.Id));
            Assert.Contains("Không thể hủy đơn hàng", ex.Message);
        }
    }
}
