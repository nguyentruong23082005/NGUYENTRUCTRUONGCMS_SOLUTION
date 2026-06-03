using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace CMS.Backend.Models
{
    public class PostIndexViewModel
    {
        public PaginatedList<Post> Posts { get; set; } = null!;
        public PostFilterModel Filter { get; set; } = null!;
        public SelectList Categories { get; set; } = null!;
    }
}
