using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMS.Data.Entities
{
    public class Store : BaseEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }
        
        [Required]
        public string Address { get; set; }
        
        public string? Phone { get; set; }
        public string? Province { get; set; }
        public string? District { get; set; }
        
        public string? ImageUrl { get; set; }
        public string? GoogleMapUrl { get; set; }
        
        public string? StoreCode { get; set; }     // Mã cửa hàng từ nguồn ngoài
        public TimeSpan OpeningTime { get; set; }
        public TimeSpan ClosingTime { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}
