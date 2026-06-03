using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CMS.Data.Entities
{
    public class OptionGroup : BaseEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;
        public bool IsRequired { get; set; } // Nhóm này có bắt buộc chọn hay không.
        public int MaxSelectable { get; set; } // Số lựa chọn tối đa trong nhóm.

        // Một nhóm có nhiều giá trị option và có thể gắn cho nhiều sản phẩm.
        public virtual ICollection<OptionValue>? OptionValues { get; set; }
        public virtual ICollection<ProductOptionGroup>? ProductOptionGroups { get; set; }
    }
}
