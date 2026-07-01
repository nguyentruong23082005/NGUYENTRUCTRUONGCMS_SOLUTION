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
        private const string BrandName = "Phúc Long Tea & Coffee";
        private const string AppBaseUrl = "http://localhost:5173";
        private const string LogoUrl = "https://phuclong.com.vn/_next/static/images/logo-ba196fcddcd6f23a70406fd4cf71d422.png";

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
            var subject = "Chào mừng bạn đến với Phúc Long Tea & Coffee";
            var body = $@"
<!DOCTYPE html>
<html lang=""vi"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>Chào mừng bạn đến với {BrandName}</title>
</head>
<body style=""margin:0;padding:0;background:#ECEFF1;font-family:Arimo,Arial,'Helvetica Neue',Helvetica,sans-serif;color:#333333;"">
  <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""background:#ECEFF1;margin:0;padding:32px 12px;"">
    <tr>
      <td align=""center"">
        <table role=""presentation"" width=""600"" cellspacing=""0"" cellpadding=""0"" style=""width:600px;max-width:100%;background:#FFFFFF;border-collapse:separate;border-spacing:0;border:1px solid #CCCCCC;border-radius:8px;overflow:hidden;"">
          {BuildBrandHeader("THÀNH VIÊN MỚI")}
          <tr>
            <td style=""background:#006F3C;padding:40px 40px 36px;text-align:center;"">
              <p style=""margin:0 0 12px;color:#FFFFFF;font-size:13px;line-height:19.5px;font-weight:700;text-transform:uppercase;"">Chào mừng đến với Phúc Long</p>
              <h1 style=""margin:0;color:#FFFFFF;font-size:28px;line-height:42px;font-weight:700;"">Rất vui được gặp bạn, {safeCustomerName}</h1>
              <p style=""margin:16px auto 0;max-width:440px;color:#FFFFFF;font-size:14px;line-height:21px;font-weight:400;"">Tài khoản của bạn đã được tạo thành công. Từ hôm nay, bạn có thể khám phá những hương vị trà và cà phê đậm chất Việt Nam cùng các ưu đãi dành riêng cho thành viên.</p>
            </td>
          </tr>
          <tr>
            <td style=""padding:32px 40px 8px;background:#FFFFFF;"">
              <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""border-collapse:collapse;"">
                <tr>
                  <td style=""padding:16px;background:#ECEFF1;border-radius:8px;border:1px solid #CCCCCC;"">
                    <h2 style=""margin:0 0 8px;color:#000000;font-size:20px;line-height:30px;font-weight:600;"">Tài khoản đã sẵn sàng</h2>
                    <p style=""margin:0;color:#333333;font-size:14px;line-height:21px;"">Đăng nhập để lưu thông tin giao hàng, theo dõi đơn hàng và nhận thông báo ưu đãi mới nhất từ Phúc Long.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style=""padding:16px 40px 8px;background:#FFFFFF;"">
              <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""border-collapse:collapse;"">
                <tr>
                  <td width=""33.33%"" valign=""top"" style=""padding:0 8px 16px 0;"">
                    <div style=""border:1px solid #ECEFF1;border-radius:8px;padding:16px;background:#FFFFFF;"">
                      <p style=""margin:0 0 8px;color:#006F3C;font-size:14px;line-height:21px;font-weight:700;"">Trà nguyên bản</p>
                      <p style=""margin:0;color:#666666;font-size:12px;line-height:18px;"">Hương trà thanh sạch, hậu vị tự nhiên.</p>
                    </div>
                  </td>
                  <td width=""33.33%"" valign=""top"" style=""padding:0 8px 16px;"">
                    <div style=""border:1px solid #ECEFF1;border-radius:8px;padding:16px;background:#FFFFFF;"">
                      <p style=""margin:0 0 8px;color:#006F3C;font-size:14px;line-height:21px;font-weight:700;"">Cà phê đậm vị</p>
                      <p style=""margin:0;color:#666666;font-size:12px;line-height:18px;"">Gu cà phê Việt Nam mạnh mẽ, cân bằng.</p>
                    </div>
                  </td>
                  <td width=""33.33%"" valign=""top"" style=""padding:0 0 16px 8px;"">
                    <div style=""border:1px solid #ECEFF1;border-radius:8px;padding:16px;background:#FFFFFF;"">
                      <p style=""margin:0 0 8px;color:#006F3C;font-size:14px;line-height:21px;font-weight:700;"">Ưu đãi thành viên</p>
                      <p style=""margin:0;color:#666666;font-size:12px;line-height:18px;"">Cập nhật khuyến mãi và sản phẩm mới.</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align=""center"" style=""padding:8px 40px 40px;background:#FFFFFF;"">
              {BuildPrimaryButton($"{AppBaseUrl}/menu", "Khám phá menu")}
            </td>
          </tr>
          {BuildFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendOrderConfirmationEmailAsync(string toEmail, string customerName,
            int orderId, decimal totalAmount, string shippingAddress)
        {
            var safeCustomerName = WebUtility.HtmlEncode(customerName);
            var safeShippingAddress = FormatMultilineText(shippingAddress);
            var subject = $"Xác nhận đơn hàng #{orderId} thành công";
            var body = $@"
<!DOCTYPE html>
<html lang=""vi"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>Xác nhận đơn hàng #{orderId}</title>
</head>
<body style=""margin:0;padding:0;background:#ECEFF1;font-family:Arimo,Arial,'Helvetica Neue',Helvetica,sans-serif;color:#333333;"">
  <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""background:#ECEFF1;margin:0;padding:32px 12px;"">
    <tr>
      <td align=""center"">
        <table role=""presentation"" width=""600"" cellspacing=""0"" cellpadding=""0"" style=""width:600px;max-width:100%;background:#FFFFFF;border-collapse:separate;border-spacing:0;border:1px solid #CCCCCC;border-radius:8px;overflow:hidden;"">
          {BuildBrandHeader("ĐƠN HÀNG ĐÃ XÁC NHẬN")}
          <tr>
            <td style=""padding:40px 40px 24px;background:#FFFFFF;text-align:center;"">
              <div style=""width:48px;height:48px;line-height:48px;background:#006F3C;color:#FFFFFF;border-radius:50%;font-size:24px;font-weight:700;margin:0 auto 20px;"">✓</div>
              <h1 style=""margin:0 0 12px;color:#000000;font-size:28px;line-height:42px;font-weight:700;"">Cảm ơn {safeCustomerName}</h1>
              <p style=""margin:0 auto;color:#333333;font-size:14px;line-height:21px;max-width:440px;"">Phúc Long đã nhận được đơn hàng của bạn. Chúng tôi đang chuẩn bị thật chỉn chu để giao đến đúng địa chỉ.</p>
            </td>
          </tr>
          <tr>
            <td style=""padding:0 40px 24px;background:#FFFFFF;"">
              <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""border-collapse:collapse;background:#ECEFF1;border:1px solid #CCCCCC;border-radius:8px;overflow:hidden;"">
                <tr>
                  <td style=""padding:16px 20px;border-bottom:1px solid #CCCCCC;"">
                    <p style=""margin:0;color:#666666;font-size:12px;line-height:18px;text-transform:uppercase;font-weight:700;"">Mã đơn hàng</p>
                    <p style=""margin:4px 0 0;color:#006F3C;font-size:20px;line-height:30px;font-weight:700;"">#PL{orderId}</p>
                  </td>
                  <td align=""right"" style=""padding:16px 20px;border-bottom:1px solid #CCCCCC;"">
                    <p style=""margin:0;color:#666666;font-size:12px;line-height:18px;text-transform:uppercase;font-weight:700;"">Tổng thanh toán</p>
                    <p style=""margin:4px 0 0;color:#000000;font-size:20px;line-height:30px;font-weight:700;"">{totalAmount:N0}đ</p>
                  </td>
                </tr>
                <tr>
                  <td colspan=""2"" style=""padding:20px;background:#FFFFFF;"">
                    <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""border-collapse:collapse;"">
                      <tr>
                        <td style=""padding:0 0 12px;color:#666666;font-size:12px;line-height:18px;text-transform:uppercase;font-weight:700;border-bottom:1px solid #ECEFF1;"">Sản phẩm</td>
                        <td align=""center"" style=""padding:0 0 12px;color:#666666;font-size:12px;line-height:18px;text-transform:uppercase;font-weight:700;border-bottom:1px solid #ECEFF1;"">SL</td>
                        <td align=""right"" style=""padding:0 0 12px;color:#666666;font-size:12px;line-height:18px;text-transform:uppercase;font-weight:700;border-bottom:1px solid #ECEFF1;"">Thành tiền</td>
                      </tr>
                      <tr>
                        <td style=""padding:16px 0 0;color:#333333;font-size:14px;line-height:21px;""><strong>Đơn hàng Phúc Long</strong><br><span style=""color:#9B9B9B;font-size:12px;line-height:18px;"">Mã đơn #PL{orderId}</span></td>
                        <td align=""center"" style=""padding:16px 0 0;color:#333333;font-size:14px;line-height:21px;"">1</td>
                        <td align=""right"" style=""padding:16px 0 0;color:#333333;font-size:14px;line-height:21px;font-weight:700;"">{totalAmount:N0}đ</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style=""padding:0 40px 32px;background:#FFFFFF;"">
              <div style=""background:#ECEFF1;border:1px solid #CCCCCC;border-radius:8px;padding:20px;"">
                <p style=""margin:0 0 8px;color:#000000;font-size:16px;line-height:24px;font-weight:600;"">Địa chỉ giao hàng</p>
                <p style=""margin:0;color:#333333;font-size:14px;line-height:21px;"">{safeShippingAddress}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td align=""center"" style=""padding:0 40px 40px;background:#FFFFFF;"">
              {BuildPrimaryButton($"{AppBaseUrl}/profile", "Theo dõi đơn hàng")}
            </td>
          </tr>
          {BuildFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendResetPasswordEmailAsync(string toEmail, string customerName, string resetLink)
        {
            var safeCustomerName = WebUtility.HtmlEncode(customerName);
            var safeResetLink = WebUtility.HtmlEncode(resetLink);
            var subject = "Đặt lại mật khẩu của bạn — Phúc Long Tea & Coffee";
            var body = $@"
<!DOCTYPE html>
<html lang=""vi"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>Đặt lại mật khẩu của bạn</title>
</head>
<body style=""margin:0;padding:0;background:#ECEFF1;font-family:Arimo,Arial,'Helvetica Neue',Helvetica,sans-serif;color:#333333;"">
  <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""background:#ECEFF1;margin:0;padding:32px 12px;"">
    <tr>
      <td align=""center"">
        <table role=""presentation"" width=""600"" cellspacing=""0"" cellpadding=""0"" style=""width:600px;max-width:100%;background:#FFFFFF;border-collapse:separate;border-spacing:0;border:1px solid #CCCCCC;border-radius:8px;overflow:hidden;"">
          {BuildBrandHeader("BẢO MẬT TÀI KHOẢN")}
          <tr>
            <td style=""background:#006F3C;padding:36px 40px;text-align:center;"">
              <h1 style=""margin:0 0 12px;color:#FFFFFF;font-size:28px;line-height:42px;font-weight:700;"">Đặt lại mật khẩu</h1>
              <p style=""margin:0 auto;color:#FFFFFF;font-size:14px;line-height:21px;max-width:420px;"">Chào {safeCustomerName}, chúng tôi nhận được yêu cầu tạo mật khẩu mới cho tài khoản Phúc Long của bạn.</p>
            </td>
          </tr>
          <tr>
            <td style=""padding:32px 40px 24px;background:#FFFFFF;text-align:center;"">
              <p style=""margin:0 auto 24px;color:#333333;font-size:14px;line-height:21px;max-width:440px;"">Nhấn nút bên dưới để đặt lại mật khẩu. Nếu bạn không thực hiện yêu cầu này, bạn có thể bỏ qua email và tài khoản vẫn được giữ an toàn.</p>
              {BuildPrimaryButton(safeResetLink, "Đặt lại mật khẩu")}
            </td>
          </tr>
          <tr>
            <td style=""padding:0 40px 40px;background:#FFFFFF;"">
              <div style=""background:#ECEFF1;border:1px solid #CCCCCC;border-radius:8px;padding:20px;"">
                <p style=""margin:0 0 8px;color:#000000;font-size:16px;line-height:24px;font-weight:600;"">Lưu ý bảo mật</p>
                <p style=""margin:0 0 8px;color:#333333;font-size:14px;line-height:21px;"">Đường dẫn đặt lại mật khẩu sẽ hết hạn trong vòng 24 giờ.</p>
                <p style=""margin:0;color:#666666;font-size:12px;line-height:18px;"">Không chia sẻ email này cho bất kỳ ai. Phúc Long không bao giờ yêu cầu bạn cung cấp mật khẩu qua email.</p>
              </div>
            </td>
          </tr>
          {BuildFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        private static string BuildBrandHeader(string label)
        {
            return $@"
          <tr>
            <td align=""center"" style=""background:#FFFFFF;padding:28px 40px 24px;border-bottom:1px solid #ECEFF1;"">
              <img src=""{LogoUrl}"" width=""150"" alt=""{BrandName}"" style=""display:block;width:150px;max-width:150px;height:auto;margin:0 auto 16px;border:0;outline:none;text-decoration:none;"">
              <span style=""display:inline-block;background:#ECEFF1;color:#006F3C;border-radius:12px;padding:4px 10px;font-size:12px;line-height:18px;font-weight:700;text-transform:uppercase;"">{label}</span>
            </td>
          </tr>";
        }

        private static string BuildPrimaryButton(string href, string label)
        {
            return $@"<a href=""{href}"" style=""display:inline-block;min-width:160px;background:#006F3C;color:#FFFFFF;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:14px;line-height:20px;font-weight:700;text-align:center;"">{label}</a>";
        }

        private static string BuildFooter()
        {
            return $@"
          <tr>
            <td align=""center"" style=""background:#171717;padding:28px 40px 24px;color:#FFFFFF;"">
              <p style=""margin:0 0 12px;color:#FFFFFF;font-size:16px;line-height:24px;font-weight:700;"">{BrandName}</p>
              <p style=""margin:0 0 16px;color:#CCCCCC;font-size:12px;line-height:18px;"">Hương vị trà và cà phê đậm chất Việt Nam.</p>
              <p style=""margin:0 0 16px;font-size:13px;line-height:19.5px;"">
                <a href=""{AppBaseUrl}/stores"" style=""color:#FFFFFF;text-decoration:none;margin:0 8px;"">Cửa hàng</a>
                <span style=""color:#666666;"">|</span>
                <a href=""{AppBaseUrl}/privacy"" style=""color:#FFFFFF;text-decoration:none;margin:0 8px;"">Chính sách bảo mật</a>
                <span style=""color:#666666;"">|</span>
                <a href=""{AppBaseUrl}/contact"" style=""color:#FFFFFF;text-decoration:none;margin:0 8px;"">Liên hệ</a>
              </p>
              <p style=""margin:0;color:#9B9B9B;font-size:12px;line-height:18px;"">© 2024 {BrandName}. All rights reserved.</p>
            </td>
          </tr>";
        }

        private static string FormatMultilineText(string value)
        {
            return WebUtility.HtmlEncode(value)
                .Replace("\r\n", "<br>")
                .Replace("\n", "<br>");
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
