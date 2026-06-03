using System.ComponentModel.DataAnnotations;

namespace CMS.Backend.Models.Api
{
    public class PaginationQuery
    {
        [Range(1, int.MaxValue, ErrorMessage = "Page must be greater than 0")]
        public int Page { get; init; } = 1;

        [Range(1, 50, ErrorMessage = "PageSize must be between 1 and 50")]
        public int PageSize { get; init; } = 10;
    }
}
