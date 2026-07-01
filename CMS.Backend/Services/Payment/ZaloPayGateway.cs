using System.Globalization;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Http;

namespace CMS.Backend.Services.Payment
{
    public class ZaloPayGateway : IPaymentGateway
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public ZaloPayGateway(IConfiguration configuration, HttpClient httpClient)
        {
            _configuration = configuration;
            _httpClient = httpClient;
        }

        public PaymentMethod Method => PaymentMethod.ZaloPay;

        public async Task<string> CreatePaymentUrlAsync(Order order, string returnUrl, string ipnUrl)
        {
            var appId = _configuration["PaymentGateways:ZaloPay:AppId"] ?? string.Empty;
            var key1 = _configuration["PaymentGateways:ZaloPay:Key1"] ?? string.Empty;
            var endpoint = _configuration["PaymentGateways:ZaloPay:Endpoint"]
                ?? "https://sb-openapi.zalopay.vn/v2/create";

            if (string.IsNullOrWhiteSpace(appId) || string.IsNullOrWhiteSpace(key1))
            {
                throw new InvalidOperationException("Thiếu cấu hình ZaloPay AppId hoặc Key1.");
            }

            var appTransId = $"{DateTime.Now:yyMMdd}_{order.Id}";
            var appTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var amount = Convert.ToInt64(order.TotalAmount);
            var appUser = order.CustomerId.ToString(CultureInfo.InvariantCulture);
            var embedData = $"{{\"redirecturl\":\"{returnUrl}\"}}";
            var item = "[]";
            var description = $"Thanh toan don hang {order.Id}";
            var bankCode = string.Empty;

            var rawData = $"{appId}|{appTransId}|{appUser}|{amount}|{appTime}|{embedData}|{item}";
            var mac = HmacSha256(key1, rawData);

            var payload = new Dictionary<string, string>
            {
                ["app_id"] = appId,
                ["app_user"] = appUser,
                ["app_time"] = appTime.ToString(CultureInfo.InvariantCulture),
                ["amount"] = amount.ToString(CultureInfo.InvariantCulture),
                ["app_trans_id"] = appTransId,
                ["embed_data"] = embedData,
                ["item"] = item,
                ["description"] = description,
                ["bank_code"] = bankCode,
                ["callback_url"] = ipnUrl,
                ["mac"] = mac
            };

            using var content = new FormUrlEncodedContent(payload);
            var response = await _httpClient.PostAsync(endpoint, content);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<ZaloPayCreateResponse>();

            if (string.IsNullOrWhiteSpace(result?.OrderUrl))
            {
                throw new InvalidOperationException(result?.ReturnMessage ?? "ZaloPay không trả về URL thanh toán.");
            }

            return result.OrderUrl;
        }

        public Task<PaymentCallbackResult> ProcessCallbackAsync(IQueryCollection query)
        {
            var key2 = _configuration["PaymentGateways:ZaloPay:Key2"] ?? string.Empty;
            if (string.IsNullOrWhiteSpace(key2))
            {
                throw new InvalidOperationException("Thiếu cấu hình ZaloPay Key2.");
            }

            var data = query["data"].ToString();
            var receivedMac = query["mac"].ToString();
            var expectedMac = HmacSha256(key2, data);
            var isValidSignature = string.Equals(receivedMac, expectedMac, StringComparison.OrdinalIgnoreCase);

            string transactionId = string.Empty;
            int orderId = 0;
            decimal amount = 0;

            if (!string.IsNullOrWhiteSpace(data))
            {
                using var document = JsonDocument.Parse(data);
                var root = document.RootElement;

                if (root.TryGetProperty("zp_trans_id", out var zpTransId))
                {
                    transactionId = zpTransId.ToString();
                }

                if (root.TryGetProperty("amount", out var amountElement)
                    && decimal.TryParse(amountElement.ToString(), NumberStyles.Number, CultureInfo.InvariantCulture, out var parsedAmount))
                {
                    amount = parsedAmount;
                }

                if (root.TryGetProperty("app_trans_id", out var appTransIdElement))
                {
                    var appTransId = appTransIdElement.GetString() ?? string.Empty;
                    var orderPart = appTransId.Split('_').LastOrDefault();
                    int.TryParse(orderPart, NumberStyles.Integer, CultureInfo.InvariantCulture, out orderId);
                }
            }

            return Task.FromResult(new PaymentCallbackResult
            {
                IsSuccess = isValidSignature,
                TransactionId = transactionId,
                OrderId = orderId,
                Amount = amount,
                ResponseCode = isValidSignature ? "1" : "0",
                Message = isValidSignature ? "ZaloPay callback processed." : "Chữ ký ZaloPay không hợp lệ."
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

        private sealed class ZaloPayCreateResponse
        {
            public string? OrderUrl { get; set; }
            public string? ReturnMessage { get; set; }
        }
    }
}
