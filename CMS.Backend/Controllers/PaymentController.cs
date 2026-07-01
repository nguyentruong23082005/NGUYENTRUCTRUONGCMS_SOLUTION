using CMS.Backend.Services.Payment;
using CMS.Backend.Services.Api;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CMS.Backend.Controllers
{
    [AllowAnonymous]
    public class PaymentController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IPaymentGatewayFactory _gatewayFactory;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public PaymentController(
            ApplicationDbContext context, 
            IPaymentGatewayFactory gatewayFactory,
            IEmailService emailService,
            IConfiguration configuration)
        {
            _context = context;
            _gatewayFactory = gatewayFactory;
            _emailService = emailService;
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<IActionResult> VnPayReturn()
        {
            var gateway = _gatewayFactory.GetGateway(PaymentMethod.VNPay);
            var result = await gateway.ProcessCallbackAsync(Request.Query);
            return await ApplyPaymentResultAsync(result);
        }

        [HttpGet]
        public async Task<IActionResult> MoMoReturn()
        {
            var gateway = _gatewayFactory.GetGateway(PaymentMethod.MoMo);
            var result = await gateway.ProcessCallbackAsync(Request.Query);
            return await ApplyPaymentResultAsync(result);
        }

        [HttpGet]
        public async Task<IActionResult> ZaloPayReturn()
        {
            var gateway = _gatewayFactory.GetGateway(PaymentMethod.ZaloPay);
            var result = await gateway.ProcessCallbackAsync(Request.Query);
            return await ApplyPaymentResultAsync(result);
        }

        private async Task<IActionResult> ApplyPaymentResultAsync(PaymentCallbackResult result)
        {
            var frontendUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";

            if (result.OrderId <= 0)
            {
                return Redirect($"{frontendUrl}/customer/account?tab=orders&payment=failed&message=InvalidOrderId");
            }

            await using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
            var order = await _context.Orders
                .FromSqlRaw("SELECT * FROM Orders WITH (UPDLOCK, ROWLOCK) WHERE Id = {0}", result.OrderId)
                .FirstOrDefaultAsync();

            if (order == null)
            {
                await transaction.RollbackAsync();
                return Redirect($"{frontendUrl}/customer/account?tab=orders&payment=failed&message=OrderNotFound");
            }

            if (order.PaymentStatus == PaymentStatus.Paid)
            {
                await transaction.CommitAsync();
                return Redirect($"{frontendUrl}/customer/account?tab=orders&payment=success&orderId={order.Id}");
            }

            if (result.IsSuccess && result.Amount == order.TotalAmount)
            {
                order.PaymentStatus = PaymentStatus.Paid;
                order.PaymentTransactionId = result.TransactionId;
                await _context.SaveChangesAsync();

                // Lấy các trường dữ liệu cần thiết trước khi context bị dispose
                var customer = await _context.Customers.FindAsync(order.CustomerId);
                var email = customer?.Email;
                var fullName = customer?.FullName;
                var orderId = order.Id;
                var totalAmount = order.TotalAmount;
                var shippingAddress = order.ShippingAddress ?? "";

                await transaction.CommitAsync();

                // Gửi email xác nhận đơn hàng sau khi thanh toán thành công hoàn toàn
                if (!string.IsNullOrEmpty(email))
                {
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            await _emailService.SendOrderConfirmationEmailAsync(
                                email, fullName ?? "", orderId, totalAmount, shippingAddress);
                        }
                        catch { /* silent */ }
                    });
                }

                return Redirect($"{frontendUrl}/customer/account?tab=orders&payment=success&orderId={order.Id}");
            }

            order.PaymentStatus = PaymentStatus.Failed;
            order.PaymentTransactionId = result.TransactionId;
            order.Status = OrderStatus.Cancelled;
            order.Notes = (order.Notes ?? string.Empty) + 
                $"\n[Hệ thống] Đơn hàng tự động hủy do thanh toán online thất bại/hủy bỏ ({DateTime.Now:dd/MM/yyyy HH:mm}).";
            
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var encodedMessage = System.Net.WebUtility.UrlEncode(result.Message ?? "Thanh toán thất bại");
            return Redirect($"{frontendUrl}/customer/account?tab=orders&payment=failed&orderId={order.Id}&message={encodedMessage}");
        }
    }
}
