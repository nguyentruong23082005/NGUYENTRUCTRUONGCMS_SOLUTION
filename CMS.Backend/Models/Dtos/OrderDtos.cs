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

        public string? ReceiverName { get; set; }

        public string? ReceiverPhone { get; set; }

        public string? ShippingAddress { get; set; }

        public string? Notes { get; set; }

        public string? VoucherCode { get; set; }

        [Required(ErrorMessage = "Danh sách sản phẩm không được trống")]
        public ICollection<OrderItemInputDto> Items { get; set; } = new List<OrderItemInputDto>();
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
        public decimal TotalAmount { get; set; }
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
    }
}
