using CMS.Data.Entities;
using Microsoft.AspNetCore.Http;

namespace CMS.Backend.Services.Payment
{
    public interface IPaymentGateway
    {
        PaymentMethod Method { get; }
        Task<string> CreatePaymentUrlAsync(Order order, string returnUrl, string ipnUrl);
        Task<PaymentCallbackResult> ProcessCallbackAsync(IQueryCollection query);
    }
}
