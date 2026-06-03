using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMS.Data.Entities
{
    public class OrderDetailOption
    {
        // Khóa chính kép OrderDetailId + OptionValueId được cấu hình trong ApplicationDbContext.
        public int OrderDetailId { get; set; }
        public int OptionValueId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; } // Giá phụ thu tại thời điểm mua.

        [ForeignKey("OrderDetailId")]
        public virtual OrderDetail? OrderDetail { get; set; }

        [ForeignKey("OptionValueId")]
        public virtual OptionValue? OptionValue { get; set; }
    }
}
