using System.ComponentModel.DataAnnotations;

namespace CMS.Backend.Models.Dtos
{
    public class ForgotPasswordDto
    {
        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        [StringLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự")]
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        [Required(ErrorMessage = "Token không được để trống")]
        [StringLength(128, ErrorMessage = "Token không hợp lệ")]
        public string Token { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu mới không được để trống")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
        [StringLength(100, ErrorMessage = "Mật khẩu không được vượt quá 100 ký tự")]
        public string NewPassword { get; set; } = string.Empty;
    }
}
