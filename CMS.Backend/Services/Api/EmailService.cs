using System.Net;
using System.Net.Mail;
using CMS.Backend.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CMS.Backend.Services.Api
{
    /// <summary>
    /// Triển khai gửi email bằng System.Net.Mail.SmtpClient.
    /// Mỗi phương thức bọc try/catch nội bộ — không ném exception lên caller.
    /// </summary>
    public sealed class EmailService : IEmailService
    {
        private readonly SmtpSettings _smtp;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<SmtpSettings> smtpOptions, ILogger<EmailService> logger)
        {
            _smtp = smtpOptions.Value;
            _logger = logger;
        }

        public async Task SendWelcomeEmailAsync(string toEmail, string customerName)
        {
            var safeCustomerName = WebUtility.HtmlEncode(customerName);
            var subject = "🎉 Chào mừng bạn đến với Phúc Long Heritage!";
            var body = $@"
<!DOCTYPE html>
<html lang=""vi"">
<head><meta charset=""UTF-8""></head>
<body style=""margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f5"">
  <div style=""max-width:600px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)"">
    <div style=""background:#006F3C;padding:32px 24px;text-align:center"">
      <h1 style=""color:#fff;margin:0;font-size:24px"">Phúc Long Heritage</h1>
      <p style=""color:#c8e6c9;margin:8px 0 0;font-size:14px"">Trà & Cà phê chất lượng từ 1968</p>
    </div>
    <div style=""padding:32px 24px"">
      <h2 style=""color:#333;margin:0 0 16px"">Xin chào {safeCustomerName}! 👋</h2>
      <p style=""color:#555;line-height:1.6"">
        Cảm ơn bạn đã đăng ký tài khoản tại <strong>Phúc Long Heritage</strong>.
        Giờ đây bạn có thể tận hưởng những ưu đãi đặc biệt dành riêng cho thành viên.
      </p>
      <div style=""text-align:center;margin:24px 0"">
        <a href=""http://localhost:5173/menu"" style=""display:inline-block;padding:12px 32px;background:#006F3C;color:#fff;text-decoration:none;border-radius:8px;font-weight:600"">
          🛒 Khám phá thực đơn ngay
        </a>
      </div>
      <p style=""color:#888;font-size:13px"">Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email.</p>
    </div>
    <div style=""background:#f9f9f9;padding:16px 24px;text-align:center;border-top:1px solid #eee"">
      <p style=""color:#aaa;font-size:12px;margin:0"">© 2024 Phúc Long Heritage — Thương hiệu trà & cà phê Việt Nam</p>
    </div>
  </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendOrderConfirmationEmailAsync(string toEmail, string customerName,
            int orderId, decimal totalAmount, string shippingAddress)
        {
            var safeCustomerName = WebUtility.HtmlEncode(customerName);
            var safeShippingAddress = WebUtility.HtmlEncode(shippingAddress);
            var subject = $"✅ Xác nhận đơn hàng #{orderId} — Phúc Long Heritage";
            var body = $@"
<!DOCTYPE html>
<html lang=""vi"">
<head><meta charset=""UTF-8""></head>
<body style=""margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f5"">
  <div style=""max-width:600px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)"">
    <div style=""background:#006F3C;padding:32px 24px;text-align:center"">
      <h1 style=""color:#fff;margin:0;font-size:24px"">Phúc Long Heritage</h1>
      <p style=""color:#c8e6c9;margin:8px 0 0;font-size:14px"">Xác nhận đơn hàng thành công</p>
    </div>
    <div style=""padding:32px 24px"">
      <h2 style=""color:#333;margin:0 0 16px"">Cảm ơn bạn đã đặt hàng, {safeCustomerName}! 🎉</h2>
      <div style=""background:#f0faf4;border:1px solid #c8e6c9;border-radius:8px;padding:20px;margin:16px 0"">
        <table style=""width:100%;border-collapse:collapse"">
          <tr>
            <td style=""padding:8px 0;color:#666"">Mã đơn hàng:</td>
            <td style=""padding:8px 0;text-align:right;font-weight:600;color:#006F3C"">#{orderId}</td>
          </tr>
          <tr>
            <td style=""padding:8px 0;color:#666;border-top:1px solid #e0e0e0"">Tổng tiền:</td>
            <td style=""padding:8px 0;text-align:right;font-weight:600;color:#d32f2f;border-top:1px solid #e0e0e0"">{totalAmount:N0} ₫</td>
          </tr>
          <tr>
            <td style=""padding:8px 0;color:#666;border-top:1px solid #e0e0e0"">Địa chỉ giao:</td>
            <td style=""padding:8px 0;text-align:right;color:#333;border-top:1px solid #e0e0e0"">{safeShippingAddress}</td>
          </tr>
        </table>
      </div>
      <p style=""color:#555;line-height:1.6"">
        Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ thông báo khi đơn hàng sẵn sàng giao.
      </p>
      <div style=""text-align:center;margin:24px 0"">
        <a href=""http://localhost:5173/profile"" style=""display:inline-block;padding:12px 32px;background:#006F3C;color:#fff;text-decoration:none;border-radius:8px;font-weight:600"">
          📦 Theo dõi đơn hàng
        </a>
      </div>
    </div>
    <div style=""background:#f9f9f9;padding:16px 24px;text-align:center;border-top:1px solid #eee"">
      <p style=""color:#aaa;font-size:12px;margin:0"">© 2024 Phúc Long Heritage — Thương hiệu trà & cà phê Việt Nam</p>
    </div>
  </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendResetPasswordEmailAsync(string toEmail, string customerName, string resetLink)
        {
            var safeCustomerName = WebUtility.HtmlEncode(customerName);
            var safeResetLink = WebUtility.HtmlEncode(resetLink);
            var subject = "🔐 Yêu cầu đặt lại mật khẩu — Phúc Long Heritage";
            var body = $@"
<!DOCTYPE html>
<html lang=""vi"">
<head><meta charset=""UTF-8""></head>
<body style=""margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f5"">
  <div style=""max-width:600px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)"">
    <div style=""background:#006F3C;padding:32px 24px;text-align:center"">
      <h1 style=""color:#fff;margin:0;font-size:24px"">Phúc Long Heritage</h1>
      <p style=""color:#c8e6c9;margin:8px 0 0;font-size:14px"">Đặt lại mật khẩu</p>
    </div>
    <div style=""padding:32px 24px"">
      <h2 style=""color:#333;margin:0 0 16px"">Xin chào {safeCustomerName},</h2>
      <p style=""color:#555;line-height:1.6"">
        Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
        Bấm nút bên dưới để tạo mật khẩu mới. Liên kết có hiệu lực trong <strong>1 giờ</strong>.
      </p>
      <div style=""text-align:center;margin:24px 0"">
        <a href=""{safeResetLink}"" style=""display:inline-block;padding:12px 32px;background:#006F3C;color:#fff;text-decoration:none;border-radius:8px;font-weight:600"">
          🔑 Đặt lại mật khẩu
        </a>
      </div>
      <p style=""color:#888;font-size:13px"">
        Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.
      </p>
    </div>
    <div style=""background:#f9f9f9;padding:16px 24px;text-align:center;border-top:1px solid #eee"">
      <p style=""color:#aaa;font-size:12px;margin:0"">© 2024 Phúc Long Heritage — Thương hiệu trà & cà phê Việt Nam</p>
    </div>
  </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        /// <summary>
        /// Gửi email qua SMTP. Bọc try/catch nội bộ — log lỗi thay vì ném exception.
        /// </summary>
        private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(_smtp.SenderEmail) || string.IsNullOrWhiteSpace(_smtp.Host))
                {
                    _logger.LogWarning("SmtpSettings chưa được cấu hình — bỏ qua gửi email tới {Email}", toEmail);
                    return;
                }

                using var message = new MailMessage();
                message.From = new MailAddress(_smtp.SenderEmail, _smtp.SenderName);
                message.To.Add(new MailAddress(toEmail));
                message.Subject = subject;
                message.Body = htmlBody;
                message.IsBodyHtml = true;

                using var client = new SmtpClient(_smtp.Host, _smtp.Port);
                client.Credentials = new NetworkCredential(_smtp.SenderEmail, _smtp.Password);
                client.EnableSsl = true;

                await client.SendMailAsync(message);
                _logger.LogInformation("Đã gửi email \"{Subject}\" tới {Email}", subject, toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi gửi email \"{Subject}\" tới {Email}", subject, toEmail);
                // Không ném exception — email thất bại không được phép ảnh hưởng business logic
            }
        }
    }
}
