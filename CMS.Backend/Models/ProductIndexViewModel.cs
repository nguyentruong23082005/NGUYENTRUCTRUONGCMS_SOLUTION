using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace CMS.Backend.Models
{
    public class ProductIndexViewModel
    {
        public PaginatedList<Product> Products { get; set; } = null!;
        public ProductFilterModel Filter { get; set; } = null!;
        public SelectList Categories { get; set; } = null!;
    }
}
