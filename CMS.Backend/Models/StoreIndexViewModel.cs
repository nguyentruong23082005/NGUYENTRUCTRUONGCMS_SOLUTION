using CMS.Data.Entities;

namespace CMS.Backend.Models
{
    public class StoreIndexViewModel
    {
        public PaginatedList<Store> Stores { get; set; } = null!;
        public StoreFilterModel Filter { get; set; } = null!;
    }
}
