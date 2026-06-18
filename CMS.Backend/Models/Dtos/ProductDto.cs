namespace CMS.Backend.Models.Dtos
{
    public sealed class ProductDto
    {
        public int Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Slug { get; init; } = string.Empty;
        public decimal Price { get; init; }
        public string? ImageUrl { get; init; }
        public string? ProductCategoryName { get; init; }
        public string? Description { get; init; }
        public int StockQuantity { get; init; }
        public System.Collections.Generic.ICollection<OptionGroupDto>? OptionGroups { get; set; }
    }
}
