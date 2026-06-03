using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMS.Data.Entities
{
    public class CustomerVoucher
    {
        // Khóa chính kép CustomerId + VoucherId được cấu hình trong ApplicationDbContext.
        public int CustomerId { get; set; }
        public int VoucherId { get; set; }

        public DateTime ClaimedAt { get; set; } = DateTime.UtcNow;
        public bool IsUsed { get; set; } = false;
        public DateTime? UsedAt { get; set; }

        [ForeignKey("CustomerId")]
        public virtual Customer? Customer { get; set; }

        [ForeignKey("VoucherId")]
        public virtual Voucher? Voucher { get; set; }
    }
}
