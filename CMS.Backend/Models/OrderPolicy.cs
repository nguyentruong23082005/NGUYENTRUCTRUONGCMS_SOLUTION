namespace CMS.Backend.Models
{
    public sealed class OrderPolicy
    {
        public int VoucherRefundWindowMinutes { get; set; } = 10;
    }
}
