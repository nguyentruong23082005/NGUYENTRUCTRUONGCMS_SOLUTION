using System.ComponentModel.DataAnnotations;

namespace CMS.Backend.Models.Api
{
    public sealed class ProductQuery : PaginationQuery
    {
        public int? CategoryId { get; init; }
        public string? CategorySlug { get; init; }
        [StringLength(100, ErrorMessage = "Keyword must be 100 characters or fewer")]
        public string? Keyword { get; init; }
        public decimal? MinPrice { get; init; }
        public decimal? MaxPrice { get; init; }
        public string SortBy { get; init; } = "CreatedAt";
        public string SortOrder { get; init; } = "desc";
    }
}
