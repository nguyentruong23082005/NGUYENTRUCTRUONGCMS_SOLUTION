using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CMS.Backend.Models.Dtos
{
    public sealed class OrderItemInputDto
    {
        [Required(ErrorMessage = "Mã sản phẩm là bắt buộc")]
        public int ProductId { get; set; }

        [Required(ErrorMessage = "Số lượng là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải ít nhất là 1")]
        public int Quantity { get; set; }

        public ICollection<int>? OptionValueIds { get; set; }
    }

    public sealed class PlaceOrderDto
    {
        public int? CustomerAddressId { get; set; }

        [StringLength(100, ErrorMessage = "Tên người nhận không được vượt quá 100 ký tự")]
        public string? ReceiverName { get; set; }

        [Phone(ErrorMessage = "Số điện thoại người nhận không đúng định dạng")]
        [StringLength(20, ErrorMessage = "Số điện thoại người nhận không được vượt quá 20 ký tự")]
        public string? ReceiverPhone { get; set; }

        [StringLength(300, ErrorMessage = "Địa chỉ giao hàng không được vượt quá 300 ký tự")]
        public string? ShippingAddress { get; set; }

        [StringLength(500, ErrorMessage = "Ghi chú không được vượt quá 500 ký tự")]
        public string? Notes { get; set; }

        [StringLength(50, ErrorMessage = "Mã voucher không được vượt quá 50 ký tự")]
        public string? VoucherCode { get; set; }

        [Required(ErrorMessage = "Danh sách sản phẩm không được trống")]
        public ICollection<OrderItemInputDto> Items { get; set; } = new List<OrderItemInputDto>();

        public int? ShippingStoreId { get; set; }

        public bool IsPickup { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Mã quận/huyện GHN không hợp lệ")]
        public int? GhnDistrictId { get; set; }

        [StringLength(20, ErrorMessage = "Mã phường/xã GHN không được vượt quá 20 ký tự")]
        public string? GhnWardCode { get; set; }

        [EnumDataType(typeof(CMS.Data.Entities.PaymentMethod), ErrorMessage = "Phương thức thanh toán không hợp lệ")]
        public CMS.Data.Entities.PaymentMethod PaymentMethod { get; set; } = CMS.Data.Entities.PaymentMethod.COD;
    }

    public sealed class OrderDetailOptionDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal PriceSurcharge { get; set; }
    }

    public sealed class OrderDetailDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ProductImageUrl { get; set; }
        public decimal BasePrice { get; set; }
        public decimal ToppingSurcharge { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
        public IReadOnlyCollection<OrderDetailOptionDto> Options { get; set; } = Array.Empty<OrderDetailOptionDto>();
    }

    public sealed class OrderDto
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string? ReceiverName { get; set; }
        public string? ReceiverPhone { get; set; }
        public string? ShippingAddress { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal ShippingFee { get; set; }
        public int? ShippingStoreId { get; set; }
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public string? PaymentUrl { get; set; }
        public IReadOnlyCollection<OrderDetailDto> Items { get; set; } = Array.Empty<OrderDetailDto>();
    }

    public sealed class OrderHistoryQuery
    {
        private int _page = 1;
        private int _pageSize = 10;

        public int Page
        {
            get => _page;
            set => _page = value < 1 ? 1 : value;
        }

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value < 1 ? 10 : (value > 50 ? 50 : value);
        }

        public string? Status { get; set; }
        public string? SearchKeyword { get; set; }
    }
}
