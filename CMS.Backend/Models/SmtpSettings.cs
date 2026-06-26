namespace CMS.Backend.Models
{
    /// <summary>
    /// Cấu hình SMTP để gửi email (đọc từ appsettings.json section "SmtpSettings").
    /// </summary>
    public class SmtpSettings
    {
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string SenderEmail { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
