using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMS.Data.Entities
{
    public class ProductImage : BaseEntity
    {
        [Key]
        public int Id { get; set; }

        public int ProductId { get; set; }
        
        [Required]
        public string ImageUrl { get; set; } = string.Empty;
        
        public bool IsPrimary { get; set; }

        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }
    }
}
