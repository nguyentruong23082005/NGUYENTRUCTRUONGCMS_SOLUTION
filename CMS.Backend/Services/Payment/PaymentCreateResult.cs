namespace CMS.Backend.Services.Payment
{
    public class PaymentCreateResult
    {
        public bool IsSuccess { get; set; }
        public string PaymentUrl { get; set; } = string.Empty;
        public string? TransactionId { get; set; }
        public string? Message { get; set; }
    }
}
