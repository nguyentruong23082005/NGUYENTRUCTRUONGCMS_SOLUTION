using System;

namespace CMS.Backend.Models.Dtos
{
    public sealed class VoucherDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public decimal DiscountValue { get; set; }
        public bool IsPercent { get; set; }
        public decimal MinimumOrderAmount { get; set; }
        public DateTime ExpiryDate { get; set; }
    }

    public sealed class VoucherValidationResultDto
    {
        public bool IsValid { get; set; }
        public decimal DiscountAmount { get; set; }
        public string Message { get; set; } = string.Empty;
        public VoucherDto? Voucher { get; set; }
    }
}
