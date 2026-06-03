using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMS.Data.Entities
{
    public class ProductOptionGroup
    {
        // Khóa chính kép ProductId + OptionGroupId được cấu hình trong ApplicationDbContext.
        public int ProductId { get; set; }
        public int OptionGroupId { get; set; }

        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }

        [ForeignKey("OptionGroupId")]
        public virtual OptionGroup? OptionGroup { get; set; }
    }
}
