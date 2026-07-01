using CMS.Backend.Models;
using CMS.Backend.Models.Dtos;
using CMS.Backend.Services.Api;
using CMS.Backend.Services.Payment;
using CMS.Backend.Services.Shipping;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace CMS.Backend.Tests
{
    public sealed class OrderApiServiceTests
    {
        [Fact]
        public async Task PlaceOrderAsync_DeliveryOrder_CalculatesShippingFeeAndAppliesToTotal()
        {
            await using var db = CreateDbContext();
            
            // Seed store
            var store = new Store
            {
                Id = 1,
                Name = "Store 1",
                Address = "Address 1",
                GhnDistrictId = 123
            };
            db.Stores.Add(store);

            // Seed product
            var product = new Product
            {
                Id = 1,
                Name = "Matcha",
                Price = 50000,
                StockQuantity = 10,
                Slug = "matcha"
            };
            db.Products.Add(product);
            
            // Seed customer
            var customer = new Customer
            {
                Id = 1,
                FullName = "Test Customer",
                Email = "customer@test.com",
                Password = "hash"
            };
            db.Customers.Add(customer);

            await db.SaveChangesAsync();

            var stockLockStrategy = new StubStockLockStrategy(product);
            var voucherService = new StubVoucherApiService();
            var shippingService = new StubGhnShippingService(30000, 1, "Store 1");
            var orderPolicy = Options.Create(new OrderPolicy());
            var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["GHN:DefaultWeight"] = "500"
            }).Build();
            var emailService = new StubEmailService();
            var logger = new LoggerFactory().CreateLogger<OrderApiService>();

            var service = new OrderApiService(
                db,
                stockLockStrategy,
                voucherService,
                shippingService,
                orderPolicy,
                configuration,
                emailService,
                logger);

            var dto = new PlaceOrderDto
            {
                ReceiverName = "Receiver",
                ReceiverPhone = "0987654321",
                ShippingAddress = "123 Street",
                IsPickup = false,
                GhnDistrictId = 456,
                GhnWardCode = "789",
                Items = new List<OrderItemInputDto>
                {
                    new OrderItemInputDto { ProductId = 1, Quantity = 2 }
                }
            };

            var result = await service.PlaceOrderAsync(1, dto);

            Assert.NotNull(result);
            Assert.Equal(30000, result.ShippingFee);
            Assert.Equal(130000, result.TotalAmount); // 2 * 50000 + 30000
            Assert.Equal(1, result.ShippingStoreId);
        }

        [Fact]
        public async Task PlaceOrderAsync_PickupOrder_SetsShippingFeeToZeroAndUsesStoreId()
        {
            await using var db = CreateDbContext();
            
            // Seed product
            var product = new Product
            {
                Id = 1,
                Name = "Matcha",
                Price = 50000,
                StockQuantity = 10,
                Slug = "matcha"
            };
            db.Products.Add(product);
            
            // Seed customer
            var customer = new Customer
            {
                Id = 1,
                FullName = "Test Customer",
                Email = "customer@test.com",
                Password = "hash"
            };
            db.Customers.Add(customer);

            await db.SaveChangesAsync();

            var stockLockStrategy = new StubStockLockStrategy(product);
            var voucherService = new StubVoucherApiService();
            var shippingService = new StubGhnShippingService(30000, 1, "Store 1");
            var orderPolicy = Options.Create(new OrderPolicy());
            var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["GHN:DefaultWeight"] = "500"
            }).Build();
            var emailService = new StubEmailService();
            var logger = new LoggerFactory().CreateLogger<OrderApiService>();

            var service = new OrderApiService(
                db,
                stockLockStrategy,
                voucherService,
                shippingService,
                orderPolicy,
                configuration,
                emailService,
                logger);

            var dto = new PlaceOrderDto
            {
                ReceiverName = "Receiver",
                ReceiverPhone = "0987654321",
                ShippingAddress = "Store Address",
                IsPickup = true,
                ShippingStoreId = 5,
                Items = new List<OrderItemInputDto>
                {
                    new OrderItemInputDto { ProductId = 1, Quantity = 2 }
                }
            };

            var result = await service.PlaceOrderAsync(1, dto);

            Assert.NotNull(result);
            Assert.Equal(0, result.ShippingFee);
            Assert.Equal(100000, result.TotalAmount); // 2 * 50000 + 0
            Assert.Equal(5, result.ShippingStoreId);
        }

        private static ApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase($"order-api-service-{Guid.NewGuid():N}")
                .ConfigureWarnings(x => x.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            return new ApplicationDbContext(options);
        }

        private class StubStockLockStrategy : IStockLockStrategy
        {
            private readonly Product _product;

            public StubStockLockStrategy(Product product)
            {
                _product = product;
            }

            public Task<Product?> LockProductAsync(int id) => Task.FromResult<Product?>(_product);
            public Task<OptionValue?> LockOptionValueAsync(int id) => Task.FromResult<OptionValue?>(null);
        }

        private class StubVoucherApiService : IVoucherApiService
        {
            public Task<IReadOnlyCollection<VoucherDto>> GetAvailableVouchersAsync() => Task.FromResult<IReadOnlyCollection<VoucherDto>>(new List<VoucherDto>());
            public Task<VoucherValidationResultDto> ValidateVoucherAsync(string code, int customerId, decimal orderSubtotal) => Task.FromResult(new VoucherValidationResultDto { IsValid = false });
        }

        private class StubGhnShippingService : IGhnShippingService
        {
            private readonly decimal _fee;
            private readonly int _storeId;
            private readonly string _storeName;

            public StubGhnShippingService(decimal fee, int storeId, string storeName)
            {
                _fee = fee;
                _storeId = storeId;
                _storeName = storeName;
            }

            public Task<List<GhnProvince>> GetProvincesAsync() => Task.FromResult(new List<GhnProvince>());
            public Task<List<GhnDistrict>> GetDistrictsAsync(int provinceId) => Task.FromResult(new List<GhnDistrict>());
            public Task<List<GhnWard>> GetWardsAsync(int districtId) => Task.FromResult(new List<GhnWard>());
            public Task<ShippingFeeResult> CalculateBestFeeAsync(int toDistrictId, string toWardCode, int totalWeightGram = 500, int? storeId = null) => Task.FromResult(new ShippingFeeResult
            {
                Fee = _fee,
                NearestStoreId = _storeId,
                NearestStoreName = _storeName,
                IsEstimated = false
            });
        }

        private class StubEmailService : IEmailService
        {
            public Task SendWelcomeEmailAsync(string toEmail, string customerName) => Task.CompletedTask;
            public Task SendOrderConfirmationEmailAsync(string toEmail, string customerName, int orderId, decimal totalAmount, string shippingAddress) => Task.CompletedTask;
            public Task SendResetPasswordEmailAsync(string toEmail, string customerName, string resetLink) => Task.CompletedTask;
        }
    }
}
