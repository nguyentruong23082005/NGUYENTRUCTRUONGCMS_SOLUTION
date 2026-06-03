namespace CMS.Backend.Models.Dtos
{
    public sealed class StoreDto
    {
        public int Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Address { get; init; } = string.Empty;
        public string? Phone { get; init; }
        public string? Province { get; init; }
        public string? District { get; init; }
        public string? ImageUrl { get; init; }
        public string? GoogleMapUrl { get; init; }
        public string OpeningTime { get; init; } = string.Empty;
        public string ClosingTime { get; init; } = string.Empty;
        public double? Latitude { get; init; }
        public double? Longitude { get; init; }
    }
}
