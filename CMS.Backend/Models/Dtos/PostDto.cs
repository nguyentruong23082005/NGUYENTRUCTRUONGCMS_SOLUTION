using System;

namespace CMS.Backend.Models.Dtos
{
    public class PostDto
    {
        public int Id { get; init; }
        public string Title { get; init; } = string.Empty;
        public string Slug { get; init; } = string.Empty;
        public string? Summary { get; init; }
        public string? ThumbnailUrl { get; init; }
        public string? PostCategoryName { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}
