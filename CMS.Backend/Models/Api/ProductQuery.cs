namespace CMS.Backend.Models.Api
{
    public sealed class ProductQuery : PaginationQuery
    {
        public int? CategoryId { get; init; }
        public string? CategorySlug { get; init; }
        public string? Keyword { get; init; }
        public string SortBy { get; init; } = "CreatedAt";
        public string SortOrder { get; init; } = "desc";
    }
}
