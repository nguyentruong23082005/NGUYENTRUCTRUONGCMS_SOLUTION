namespace CMS.Backend.Models.Dtos
{
    public sealed class PostCategoryDto
    {
        public int Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Slug { get; init; } = string.Empty;
        public string? Description { get; init; }
        public int? ParentId { get; init; }
        public string? ParentName { get; init; }
        public System.Collections.Generic.List<PostCategoryDto> Children { get; set; } = new();
    }
}
