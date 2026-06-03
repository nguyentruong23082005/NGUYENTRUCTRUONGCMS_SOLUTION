namespace CMS.Backend.Models.Dtos
{
    public sealed class BannerDto
    {
        public int Id { get; init; }
        public string Title { get; init; } = string.Empty;
        public string ImageUrl { get; init; } = string.Empty;
        public string? LinkUrl { get; init; }
        public string Position { get; init; } = string.Empty;
        public int SortOrder { get; init; }
    }
}
