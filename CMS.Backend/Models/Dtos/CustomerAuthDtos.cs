using System.ComponentModel.DataAnnotations;

namespace CMS.Backend.Models.Dtos
{
    public sealed class CustomerDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
    }

    public sealed class RegisterDto
    {
        [Required(ErrorMessage = "Họ và tên không được để trống")]
        [StringLength(100, ErrorMessage = "Họ và tên không được vượt quá 100 ký tự")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email không được để trống")]
        [RegularExpression(@"^(?!.*@(gmai\.co|gmail\.co|gmal\.com|gmial\.com|gmai\.com|yaho\.com|yahoo\.co|hotmai\.com|hotmial\.com|outlok\.com|outlook\.co)$)[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$", ErrorMessage = "Email không đúng định dạng")]
        [StringLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự")]
        public string Email { get; set; } = string.Empty;

        [RegularExpression(@"^$|^[0-9]{10,11}$", ErrorMessage = "Số điện thoại không hợp lệ (yêu cầu 10-11 chữ số)")]
        [StringLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự")]
        public string? Phone { get; set; }

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải từ 6 ký tự trở lên")]
        [StringLength(100, ErrorMessage = "Mật khẩu không được vượt quá 100 ký tự")]
        public string Password { get; set; } = string.Empty;
    }

    public sealed class LoginDto
    {
        [Required(ErrorMessage = "Email không được để trống")]
        [RegularExpression(@"^(?!.*@(gmai\.co|gmail\.co|gmal\.com|gmial\.com|gmai\.com|yaho\.com|yahoo\.co|hotmai\.com|hotmial\.com|outlok\.com|outlook\.co)$)[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$", ErrorMessage = "Email không đúng định dạng")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        public string Password { get; set; } = string.Empty;
    }

    public sealed class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public CustomerDto Customer { get; set; } = new();
    }

    public sealed class UpdateProfileDto
    {
        [Required(ErrorMessage = "Họ và tên không được để trống")]
        [StringLength(100, ErrorMessage = "Họ và tên không được vượt quá 100 ký tự")]
        public string FullName { get; set; } = string.Empty;

        [RegularExpression(@"^$|^[0-9]{10,11}$", ErrorMessage = "Số điện thoại không hợp lệ (yêu cầu 10-11 chữ số)")]
        [StringLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự")]
        public string? Phone { get; set; }

        [StringLength(100, ErrorMessage = "Mật khẩu cũ không được vượt quá 100 ký tự")]
        public string? CurrentPassword { get; set; }

        [MinLength(6, ErrorMessage = "Mật khẩu mới phải từ 6 ký tự trở lên")]
        [StringLength(100, ErrorMessage = "Mật khẩu mới không được vượt quá 100 ký tự")]
        public string? NewPassword { get; set; }
    }

    public sealed class SocialLoginDto
    {
        [Required(ErrorMessage = "IdToken không được để trống")]
        public string IdToken { get; set; } = string.Empty;
    }
}
