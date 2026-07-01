using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Http;

namespace CMS.Backend.Services.Payment
{
    public class VnPayGateway : IPaymentGateway
    {
        private readonly IConfiguration _configuration;

        public VnPayGateway(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public PaymentMethod Method => PaymentMethod.VNPay;

        public Task<string> CreatePaymentUrlAsync(Order order, string returnUrl, string ipnUrl)
        {
            var tmnCode = _configuration["PaymentGateways:VnPay:TmnCode"] ?? string.Empty;
            var hashSecret = _configuration["PaymentGateways:VnPay:HashSecret"] ?? string.Empty;
            var baseUrl = _configuration["PaymentGateways:VnPay:BaseUrl"]
                ?? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

            if (string.IsNullOrWhiteSpace(tmnCode) || string.IsNullOrWhiteSpace(hashSecret))
            {
                throw new InvalidOperationException("Thiếu cấu hình VNPay TmnCode hoặc HashSecret.");
            }

            var pay = new SortedDictionary<string, string>(StringComparer.Ordinal)
            {
                ["vnp_Version"] = "2.1.0",
                ["vnp_Command"] = "pay",
                ["vnp_TmnCode"] = tmnCode,
                ["vnp_Amount"] = Convert.ToInt64(order.TotalAmount * 100).ToString(CultureInfo.InvariantCulture),
                ["vnp_CreateDate"] = DateTime.Now.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture),
                ["vnp_CurrCode"] = "VND",
                ["vnp_IpAddr"] = "127.0.0.1",
                ["vnp_Locale"] = "vn",
                ["vnp_OrderInfo"] = $"Thanh toan don hang {order.Id}",
                ["vnp_OrderType"] = "other",
                ["vnp_ReturnUrl"] = returnUrl,
                ["vnp_TxnRef"] = order.Id.ToString(CultureInfo.InvariantCulture)
            };

            var signData = BuildQuery(pay, encodeValues: true);
            var secureHash = HmacSha512(hashSecret, signData);
            var query = BuildQuery(pay, encodeValues: true);

            return Task.FromResult($"{baseUrl}?{query}&vnp_SecureHash={secureHash}");
        }

        public Task<PaymentCallbackResult> ProcessCallbackAsync(IQueryCollection query)
        {
            var hashSecret = _configuration["PaymentGateways:VnPay:HashSecret"] ?? string.Empty;
            if (string.IsNullOrWhiteSpace(hashSecret))
            {
                throw new InvalidOperationException("Thiếu cấu hình VNPay HashSecret.");
            }

            var receivedHash = query["vnp_SecureHash"].ToString();
            var data = query
                .Where(kvp => kvp.Key.StartsWith("vnp_", StringComparison.OrdinalIgnoreCase)
                    && !string.Equals(kvp.Key, "vnp_SecureHash", StringComparison.OrdinalIgnoreCase)
                    && !string.Equals(kvp.Key, "vnp_SecureHashType", StringComparison.OrdinalIgnoreCase))
                .ToDictionary(kvp => kvp.Key, kvp => kvp.Value.ToString(), StringComparer.Ordinal);

            var sortedData = new SortedDictionary<string, string>(data, StringComparer.Ordinal);
            var expectedHash = HmacSha512(hashSecret, BuildQuery(sortedData, encodeValues: true));
            var isValidSignature = string.Equals(receivedHash, expectedHash, StringComparison.OrdinalIgnoreCase);

            int.TryParse(query["vnp_TxnRef"], NumberStyles.Integer, CultureInfo.InvariantCulture, out var orderId);
            decimal amount = 0;
            if (decimal.TryParse(query["vnp_Amount"], NumberStyles.Number, CultureInfo.InvariantCulture, out var rawAmount))
            {
                amount = rawAmount / 100;
            }

            var responseCode = query["vnp_ResponseCode"].ToString();
            var transactionStatus = query["vnp_TransactionStatus"].ToString();
            var isSuccess = isValidSignature && responseCode == "00" && transactionStatus == "00";

            return Task.FromResult(new PaymentCallbackResult
            {
                IsSuccess = isSuccess,
                TransactionId = query["vnp_TransactionNo"].ToString(),
                OrderId = orderId,
                Amount = amount,
                ResponseCode = responseCode,
                Message = isValidSignature ? "VNPay callback processed." : "Chữ ký VNPay không hợp lệ."
            });
        }

        private static string BuildQuery(SortedDictionary<string, string> data, bool encodeValues)
        {
            return string.Join("&", data.Select(kvp =>
            {
                var value = encodeValues ? WebUtility.UrlEncode(kvp.Value) : kvp.Value;
                return $"{kvp.Key}={value}";
            }));
        }

        private static string HmacSha512(string key, string input)
        {
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var inputBytes = Encoding.UTF8.GetBytes(input);
            using var hmac = new HMACSHA512(keyBytes);
            var hashBytes = hmac.ComputeHash(inputBytes);
            return Convert.ToHexString(hashBytes).ToLowerInvariant();
        }
    }
}
