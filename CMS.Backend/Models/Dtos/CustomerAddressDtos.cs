using System;
using System.ComponentModel.DataAnnotations;

namespace CMS.Backend.Models.Dtos
{
    public sealed class CustomerAddressDto
    {
        public int Id { get; set; }
        public string ReceiverName { get; set; } = string.Empty;
        public string ReceiverPhone { get; set; } = string.Empty;
        public string AddressLine { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string Ward { get; set; } = string.Empty;
        public string AddressType { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public sealed class CreateAddressDto
    {
        [Required(ErrorMessage = "Tên người nhận không được để trống")]
        [StringLength(100, ErrorMessage = "Tên người nhận không vượt quá 100 ký tự")]
        public string ReceiverName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Số điện thoại người nhận không được để trống")]
        [Phone(ErrorMessage = "Số điện thoại không đúng định dạng")]
        [StringLength(20, ErrorMessage = "Số điện thoại không vượt quá 20 ký tự")]
        public string ReceiverPhone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Địa chỉ chi tiết không được để trống")]
        [StringLength(200, ErrorMessage = "Địa chỉ chi tiết không vượt quá 200 ký tự")]
        public string AddressLine { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tỉnh/Thành phố không được để trống")]
        [StringLength(100, ErrorMessage = "Tỉnh/Thành phố không vượt quá 100 ký tự")]
        public string Province { get; set; } = string.Empty;

        [Required(ErrorMessage = "Quận/Huyện không được để trống")]
        [StringLength(100, ErrorMessage = "Quận/Huyện không vượt quá 100 ký tự")]
        public string District { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phường/Xã không được để trống")]
        [StringLength(100, ErrorMessage = "Phường/Xã không vượt quá 100 ký tự")]
        public string Ward { get; set; } = string.Empty;

        [Required(ErrorMessage = "Loại địa chỉ không được để trống")]
        [StringLength(50, ErrorMessage = "Loại địa chỉ không vượt quá 50 ký tự")]
        public string AddressType { get; set; } = string.Empty; // Home, Office, etc.

        public bool IsDefault { get; set; }
    }
}
