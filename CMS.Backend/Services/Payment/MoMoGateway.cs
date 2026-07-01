using System.Globalization;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Http;

namespace CMS.Backend.Services.Payment
{
    public class MoMoGateway : IPaymentGateway
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public MoMoGateway(IConfiguration configuration, HttpClient httpClient)
        {
            _configuration = configuration;
            _httpClient = httpClient;
        }

        public PaymentMethod Method => PaymentMethod.MoMo;

        public async Task<string> CreatePaymentUrlAsync(Order order, string returnUrl, string ipnUrl)
        {
            var partnerCode = _configuration["PaymentGateways:MoMo:PartnerCode"] ?? string.Empty;
            var accessKey = _configuration["PaymentGateways:MoMo:AccessKey"] ?? string.Empty;
            var secretKey = _configuration["PaymentGateways:MoMo:SecretKey"] ?? string.Empty;
            var endpoint = _configuration["PaymentGateways:MoMo:Endpoint"]
                ?? "https://test-payment.momo.vn/v2/gateway/api/create";

            if (string.IsNullOrWhiteSpace(partnerCode)
                || string.IsNullOrWhiteSpace(accessKey)
                || string.IsNullOrWhiteSpace(secretKey))
            {
                throw new InvalidOperationException("Thiếu cấu hình MoMo PartnerCode, AccessKey hoặc SecretKey.");
            }

            var requestId = $"ORDER-{order.Id}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            var orderId = $"{order.Id}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            var amount = Convert.ToInt64(order.TotalAmount).ToString(CultureInfo.InvariantCulture);
            var orderInfo = $"Thanh toan don hang {order.Id}";
            var requestType = "captureWallet";
            var extraData = string.Empty;

            var rawSignature = $"accessKey={accessKey}&amount={amount}&extraData={extraData}&ipnUrl={ipnUrl}&orderId={orderId}&orderInfo={orderInfo}&partnerCode={partnerCode}&redirectUrl={returnUrl}&requestId={requestId}&requestType={requestType}";
            var signature = HmacSha256(secretKey, rawSignature);

            var payload = new
            {
                partnerCode,
                accessKey,
                requestId,
                amount,
                orderId,
                orderInfo,
                redirectUrl = returnUrl,
                ipnUrl,
                extraData,
                requestType,
                signature,
                lang = "vi"
            };

            var response = await _httpClient.PostAsJsonAsync(endpoint, payload);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new InvalidOperationException($"MoMo API returned error ({response.StatusCode}): {errorContent}");
            }
            var result = await response.Content.ReadFromJsonAsync<MoMoCreateResponse>();

            if (string.IsNullOrWhiteSpace(result?.PayUrl))
            {
                throw new InvalidOperationException(result?.Message ?? "MoMo không trả về URL thanh toán.");
            }

            return result.PayUrl;
        }

        public Task<PaymentCallbackResult> ProcessCallbackAsync(IQueryCollection query)
        {
            var secretKey = _configuration["PaymentGateways:MoMo:SecretKey"] ?? string.Empty;
            if (string.IsNullOrWhiteSpace(secretKey))
            {
                throw new InvalidOperationException("Thiếu cấu hình MoMo SecretKey.");
            }

            var rawSignature = $"accessKey={_configuration["PaymentGateways:MoMo:AccessKey"]}&amount={query["amount"]}&extraData={query["extraData"]}&message={query["message"]}&orderId={query["orderId"]}&orderInfo={query["orderInfo"]}&orderType={query["orderType"]}&partnerCode={query["partnerCode"]}&payType={query["payType"]}&requestId={query["requestId"]}&responseTime={query["responseTime"]}&resultCode={query["resultCode"]}&transId={query["transId"]}";
            var expectedSignature = HmacSha256(secretKey, rawSignature);
            var isValidSignature = string.Equals(query["signature"], expectedSignature, StringComparison.OrdinalIgnoreCase);

            Console.WriteLine("=== MOMO CALLBACK SIGNATURE VERIFICATION ===");
            Console.WriteLine($"Raw string: {rawSignature}");
            Console.WriteLine($"Expected Signature: {expectedSignature}");
            Console.WriteLine($"Received Signature: {query["signature"]}");
            Console.WriteLine($"Is Valid: {isValidSignature}");
            Console.WriteLine($"Result Code: {query["resultCode"]}");
            Console.WriteLine("============================================");

            var rawOrderId = query["orderId"].ToString();
            var actualOrderIdStr = rawOrderId.Contains('-') ? rawOrderId.Split('-')[0] : rawOrderId;
            int.TryParse(actualOrderIdStr, NumberStyles.Integer, CultureInfo.InvariantCulture, out var orderId);
            decimal.TryParse(query["amount"], NumberStyles.Number, CultureInfo.InvariantCulture, out var amount);
            var resultCode = query["resultCode"].ToString();

            // Kiểm tra resultCode == "0" để xác nhận giao dịch thành công thực tế từ MoMo
            var isSuccess = isValidSignature && resultCode == "0";

            return Task.FromResult(new PaymentCallbackResult
            {
                IsSuccess = isSuccess,
                TransactionId = query["transId"].ToString(),
                OrderId = orderId,
                Amount = amount,
                ResponseCode = resultCode,
                Message = isValidSignature ? query["message"].ToString() : "Chữ ký MoMo không hợp lệ."
            });
        }

        private static string HmacSha256(string key, string input)
        {
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var inputBytes = Encoding.UTF8.GetBytes(input);
            using var hmac = new HMACSHA256(keyBytes);
            var hashBytes = hmac.ComputeHash(inputBytes);
            return Convert.ToHexString(hashBytes).ToLowerInvariant();
        }

        private sealed class MoMoCreateResponse
        {
            [System.Text.Json.Serialization.JsonPropertyName("payUrl")]
            public string? PayUrl { get; set; }

            [System.Text.Json.Serialization.JsonPropertyName("message")]
            public string? Message { get; set; }

            [System.Text.Json.Serialization.JsonPropertyName("resultCode")]
            public int ResultCode { get; set; }
        }
    }
}
