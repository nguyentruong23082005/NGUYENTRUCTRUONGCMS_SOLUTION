using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMS.Data.Entities
{
    public class OptionValue : BaseEntity
    {
        [Key]
        public int Id { get; set; }

        public int OptionGroupId { get; set; }

        [Required]
        public string Name { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PriceSurcharge { get; set; }

        public bool IsActive { get; set; }
        public int? StockQuantity { get; set; } // Null for infinite

        [ForeignKey("OptionGroupId")]
        public virtual OptionGroup? OptionGroup { get; set; }

        public virtual ICollection<OrderDetailOption>? OrderDetailOptions { get; set; }
    }
}
