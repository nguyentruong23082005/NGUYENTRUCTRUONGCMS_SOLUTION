namespace CMS.Backend.Services.Api
{
    /// <summary>
    /// Interface dịch vụ gửi email cho hệ thống CMS.
    /// </summary>
    public interface IEmailService
    {
        /// <summary>
        /// Gửi email chào mừng khi khách hàng đăng ký thành công.
        /// </summary>
        Task SendWelcomeEmailAsync(string toEmail, string customerName);

        /// <summary>
        /// Gửi email xác nhận đơn hàng sau khi đặt hàng thành công (TC31).
        /// </summary>
        Task SendOrderConfirmationEmailAsync(string toEmail, string customerName,
            int orderId, decimal totalAmount, string shippingAddress);

        /// <summary>
        /// Gửi email hướng dẫn đặt lại mật khẩu (TC46).
        /// </summary>
        Task SendResetPasswordEmailAsync(string toEmail, string customerName, string resetLink);
    }
}
