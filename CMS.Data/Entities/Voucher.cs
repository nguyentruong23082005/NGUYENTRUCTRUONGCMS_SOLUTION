using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMS.Data.Entities
{
    public class Voucher : BaseEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty; // Mã giảm giá, ví dụ: SALE20.

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountValue { get; set; }
        public bool IsPercent { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal MinimumOrderAmount { get; set; }

        public DateTime ExpiryDate { get; set; }
        public bool IsActive { get; set; }

        // Quan hệ: voucher có thể áp dụng cho nhiều đơn hàng và nhiều khách hàng.
        public virtual ICollection<Order>? Orders { get; set; }
        public virtual ICollection<CustomerVoucher>? CustomerVouchers { get; set; }
    }
}
