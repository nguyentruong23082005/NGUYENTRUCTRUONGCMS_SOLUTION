namespace CMS.Backend.Services.Payment
{
    public class PaymentCallbackResult
    {
        public bool IsSuccess { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
        public string? ResponseCode { get; set; }
        public string? Message { get; set; }
    }
}
