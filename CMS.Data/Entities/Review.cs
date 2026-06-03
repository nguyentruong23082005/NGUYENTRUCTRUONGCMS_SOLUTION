using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMS.Data.Entities
{
    public class Review : BaseEntity
    {
        [Key]
        public int Id { get; set; }

        public int ProductId { get; set; }
        public int CustomerId { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }
        
        public string? Comment { get; set; }

        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }

        [ForeignKey("CustomerId")]
        public virtual Customer? Customer { get; set; }
    }
}
