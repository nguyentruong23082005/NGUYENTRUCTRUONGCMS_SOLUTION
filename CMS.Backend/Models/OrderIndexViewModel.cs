using CMS.Data.Entities;

namespace CMS.Backend.Models
{
    public class OrderIndexViewModel
    {
        public PaginatedList<Order> Orders { get; set; } = null!;
        public OrderFilterModel Filter { get; set; } = null!;
    }
}
