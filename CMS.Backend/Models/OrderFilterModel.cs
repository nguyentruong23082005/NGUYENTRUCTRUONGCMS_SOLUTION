using CMS.Data.Entities;
using System;

namespace CMS.Backend.Models
{
    public class OrderFilterModel
    {
        public string? Search { get; set; }
        public OrderStatus? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
