using CMS.Data.Entities;

namespace CMS.Backend.Services.Payment
{
    public interface IPaymentGatewayFactory
    {
        IPaymentGateway GetGateway(PaymentMethod method);
    }

    public class PaymentGatewayFactory : IPaymentGatewayFactory
    {
        private readonly IEnumerable<IPaymentGateway> _gateways;

        public PaymentGatewayFactory(IEnumerable<IPaymentGateway> gateways)
        {
            _gateways = gateways;
        }

        public IPaymentGateway GetGateway(PaymentMethod method)
        {
            var gateway = _gateways.FirstOrDefault(g => g.Method == method);
            if (gateway == null)
            {
                throw new NotSupportedException($"Phương thức thanh toán {method} chưa được hỗ trợ.");
            }

            return gateway;
        }
    }
}
