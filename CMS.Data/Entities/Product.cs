
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CMS.Data.Entities
{
    public class Product : BaseEntity
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Tên sản phẩm không được để trống")]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Range(0, double.MaxValue)]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public int StockQuantity { get; set; } // Số lượng tồn kho

        public string? ImageUrl { get; set; }

        // Khóa ngoại nối tới ProductCategory
        public int ProductCategoryId { get; set; }

        [ForeignKey("ProductCategoryId")]
        public virtual ProductCategory? ProductCategory { get; set; }

        public virtual ICollection<ProductOptionGroup>? ProductOptionGroups { get; set; }
        public virtual ICollection<Review>? Reviews { get; set; }
        public virtual ICollection<ProductImage>? ProductImages { get; set; }

        public string Slug { get; set; } = string.Empty;
    }
}
