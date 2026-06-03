namespace CMS.Backend.Models.Dtos
{
    public sealed class ProductCategoryDto
    {
        public int Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Slug { get; init; } = string.Empty;
        public string? Description { get; init; }
    }
}
