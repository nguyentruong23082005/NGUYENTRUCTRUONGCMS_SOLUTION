using System.Collections.Generic;

namespace CMS.Backend.Models.Dtos
{
    public sealed class OptionValueDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal PriceSurcharge { get; set; }
        public int? StockQuantity { get; set; }
    }

    public sealed class OptionGroupDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public int MaxSelectable { get; set; }
        public ICollection<OptionValueDto> OptionValues { get; set; } = new List<OptionValueDto>();
    }
}
