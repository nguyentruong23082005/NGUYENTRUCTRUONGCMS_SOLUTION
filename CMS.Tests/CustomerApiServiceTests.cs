using CMS.Backend.Models.Dtos;
using CMS.Backend.Services.Api;
using CMS.Backend.Helpers;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace CMS.Tests
{
    public class CustomerApiServiceTests
    {
        private ApplicationDbContext CreateInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        private IConfiguration CreateTestConfiguration()
        {
            return new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    {"Jwt:Key", "PhucLongPremiumSecretKeyForReactJSFrontEnd2026SuperSecureKey32Chars"},
                    {"Jwt:Issuer", "CMS.Backend"},
                    {"Jwt:Audience", "CMS.Frontend"},
                    {"Jwt:ExpiryMinutes", "1440"}
                })
                .Build();
        }

        private IMemoryCache CreateTestCache()
        {
            return new MemoryCache(new MemoryCacheOptions());
        }

        [Fact]
        public async Task RegisterAsync_ValidDto_Succeeds()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var config = CreateTestConfiguration();
            var cache = CreateTestCache();
            var service = new CustomerApiService(db, config, cache);

            var registerDto = new RegisterDto
            {
                FullName = "Nguyen Van A",
                Email = "vna@example.com",
                Password = "SecretPassword123",
                Phone = "0901234567"
            };

            // Act
            var result = await service.RegisterAsync(registerDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Nguyen Van A", result.FullName);
            Assert.Equal("vna@example.com", result.Email);

            var customerInDb = await db.Customers.FirstOrDefaultAsync(c => c.Email == "vna@example.com");
            Assert.NotNull(customerInDb);
            Assert.Equal(1, customerInDb.TokenVersion);
        }

        [Fact]
        public async Task RegisterAsync_DuplicateEmail_ThrowsException()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var config = CreateTestConfiguration();
            var cache = CreateTestCache();
            var service = new CustomerApiService(db, config, cache);

            var existing = new Customer
            {
                FullName = "Nguyen Van A",
                Email = "vna@example.com",
                TokenVersion = 1
            };
            db.Customers.Add(existing);
            await db.SaveChangesAsync();

            var registerDto = new RegisterDto
            {
                FullName = " Nguyen Van B ",
                Email = "vna@example.com",
                Password = "Password456"
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => service.RegisterAsync(registerDto));
            Assert.Equal("Email này đã được sử dụng.", exception.Message);
        }

        [Fact]
        public async Task LoginAsync_ValidCredentials_ReturnsTokenAndDto()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var config = CreateTestConfiguration();
            var cache = CreateTestCache();
            var service = new CustomerApiService(db, config, cache);

            var customer = new Customer
            {
                FullName = "Nguyen Van A",
                Email = "vna@example.com",
                TokenVersion = 1
            };
            customer.Password = PasswordHasher.Hash(customer, "Secret123");
            db.Customers.Add(customer);
            await db.SaveChangesAsync();

            var loginDto = new LoginDto
            {
                Email = "vna@example.com",
                Password = "Secret123"
            };

            // Act
            var response = await service.LoginAsync(loginDto);

            // Assert
            Assert.NotNull(response);
            Assert.NotEmpty(response.Token);
            Assert.Equal("Nguyen Van A", response.Customer.FullName);
        }

        [Fact]
        public async Task LoginAsync_InvalidPassword_ReturnsNull()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var config = CreateTestConfiguration();
            var cache = CreateTestCache();
            var service = new CustomerApiService(db, config, cache);

            var customer = new Customer
            {
                FullName = "Nguyen Van A",
                Email = "vna@example.com",
                TokenVersion = 1
            };
            customer.Password = PasswordHasher.Hash(customer, "Secret123");
            db.Customers.Add(customer);
            await db.SaveChangesAsync();

            var loginDto = new LoginDto
            {
                Email = "vna@example.com",
                Password = "WrongPassword"
            };

            // Act
            var response = await service.LoginAsync(loginDto);

            // Assert
            Assert.Null(response);
        }

        [Fact]
        public async Task UpdateProfileAsync_ChangePassword_IncrementsTokenVersion()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var config = CreateTestConfiguration();
            var cache = CreateTestCache();
            var service = new CustomerApiService(db, config, cache);

            var customer = new Customer
            {
                FullName = "Nguyen Van A",
                Email = "vna@example.com",
                TokenVersion = 5
            };
            customer.Password = PasswordHasher.Hash(customer, "OldSecret123");
            db.Customers.Add(customer);
            await db.SaveChangesAsync();

            var updateDto = new UpdateProfileDto
            {
                FullName = "Nguyen Van Updated",
                Phone = "0987654321",
                CurrentPassword = "OldSecret123",
                NewPassword = "NewSecret123"
            };

            // Act
            var result = await service.UpdateProfileAsync(customer.Id, updateDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Nguyen Van Updated", result.FullName);
            Assert.Equal("0987654321", result.Phone);

            var updatedCustomer = await db.Customers.FindAsync(customer.Id);
            Assert.NotNull(updatedCustomer);
            Assert.Equal(6, updatedCustomer.TokenVersion);
        }

        [Fact]
        public async Task LogoutAsync_IncrementsTokenVersion()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var config = CreateTestConfiguration();
            var cache = CreateTestCache();
            var service = new CustomerApiService(db, config, cache);

            var customer = new Customer
            {
                FullName = "Nguyen Van A",
                Email = "vna@example.com",
                TokenVersion = 10
            };
            db.Customers.Add(customer);
            await db.SaveChangesAsync();

            // Act
            await service.LogoutAsync(customer.Id);

            // Assert
            var updatedCustomer = await db.Customers.FindAsync(customer.Id);
            Assert.NotNull(updatedCustomer);
            Assert.Equal(11, updatedCustomer.TokenVersion);
        }
    }
}
