using CMS.Backend.Services.Api;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace CMS.Tests
{
    public class VoucherApiServiceTests
    {
        private ApplicationDbContext CreateInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task GetAvailableVouchersAsync_ReturnsOnlyActiveAndNonExpired()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new VoucherApiService(db);

            var activeVoucher = new Voucher
            {
                Code = "ACTIVE1", IsActive = true, ExpiryDate = DateTime.Now.AddDays(5),
                DiscountValue = 10000, IsPercent = false, MinimumOrderAmount = 50000
            };
            var expiredVoucher = new Voucher
            {
                Code = "EXPIRED", IsActive = true, ExpiryDate = DateTime.Now.AddDays(-2),
                DiscountValue = 10000, IsPercent = false, MinimumOrderAmount = 50000
            };
            var inactiveVoucher = new Voucher
            {
                Code = "INACTIVE", IsActive = false, ExpiryDate = DateTime.Now.AddDays(5),
                DiscountValue = 10000, IsPercent = false, MinimumOrderAmount = 50000
            };

            db.Vouchers.AddRange(activeVoucher, expiredVoucher, inactiveVoucher);
            await db.SaveChangesAsync();

            // Act
            var result = await service.GetAvailableVouchersAsync();

            // Assert
            Assert.Single(result);
            Assert.Equal("ACTIVE1", result.First().Code);
        }

        [Fact]
        public async Task ValidateVoucherAsync_VoucherNotFound_ReturnsInvalid()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new VoucherApiService(db);

            // Act
            var result = await service.ValidateVoucherAsync("NONEXIST", 1, 100000);

            // Assert
            Assert.False(result.IsValid);
            Assert.Equal("Mã giảm giá không tồn tại.", result.Message);
        }

        [Fact]
        public async Task ValidateVoucherAsync_VoucherInactive_ReturnsInvalid()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new VoucherApiService(db);

            var voucher = new Voucher
            {
                Code = "INACTIVE", IsActive = false, ExpiryDate = DateTime.Now.AddDays(5),
                DiscountValue = 10000, IsPercent = false, MinimumOrderAmount = 50000
            };
            db.Vouchers.Add(voucher);
            await db.SaveChangesAsync();

            // Act
            var result = await service.ValidateVoucherAsync("INACTIVE", 1, 100000);

            // Assert
            Assert.False(result.IsValid);
            Assert.Equal("Mã giảm giá đã bị ngưng hoạt động.", result.Message);
        }

        [Fact]
        public async Task ValidateVoucherAsync_VoucherExpired_ReturnsInvalid()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new VoucherApiService(db);

            var voucher = new Voucher
            {
                Code = "EXPIRED", IsActive = true, ExpiryDate = DateTime.Now.AddDays(-1),
                DiscountValue = 10000, IsPercent = false, MinimumOrderAmount = 50000
            };
            db.Vouchers.Add(voucher);
            await db.SaveChangesAsync();

            // Act
            var result = await service.ValidateVoucherAsync("EXPIRED", 1, 100000);

            // Assert
            Assert.False(result.IsValid);
            Assert.Equal("Mã giảm giá đã hết hạn sử dụng.", result.Message);
        }

        [Fact]
        public async Task ValidateVoucherAsync_VoucherAlreadyUsed_ReturnsInvalid()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new VoucherApiService(db);
            int customerId = 1;

            var voucher = new Voucher
            {
                Code = "USED_CODE", IsActive = true, ExpiryDate = DateTime.Now.AddDays(5),
                DiscountValue = 10000, IsPercent = false, MinimumOrderAmount = 50000
            };
            db.Vouchers.Add(voucher);
            await db.SaveChangesAsync();

            var cv = new CustomerVoucher
            {
                CustomerId = customerId,
                VoucherId = voucher.Id,
                IsUsed = true,
                UsedAt = DateTime.UtcNow
            };
            db.CustomerVouchers.Add(cv);
            await db.SaveChangesAsync();

            // Act
            var result = await service.ValidateVoucherAsync("USED_CODE", customerId, 100000);

            // Assert
            Assert.False(result.IsValid);
            Assert.Equal("Bạn đã sử dụng mã giảm giá này rồi.", result.Message);
        }

        [Fact]
        public async Task ValidateVoucherAsync_OrderSubtotalLessThanMinimum_ReturnsInvalid()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new VoucherApiService(db);

            var voucher = new Voucher
            {
                Code = "MINLIMIT", IsActive = true, ExpiryDate = DateTime.Now.AddDays(5),
                DiscountValue = 10000, IsPercent = false, MinimumOrderAmount = 100000
            };
            db.Vouchers.Add(voucher);
            await db.SaveChangesAsync();

            // Act
            var result = await service.ValidateVoucherAsync("MINLIMIT", 1, 50000);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Đơn hàng tối thiểu phải đạt", result.Message);
        }

        [Fact]
        public async Task ValidateVoucherAsync_FixedDiscount_CalculatesCorrectly()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new VoucherApiService(db);

            var voucher = new Voucher
            {
                Code = "FIXED", IsActive = true, ExpiryDate = DateTime.Now.AddDays(5),
                DiscountValue = 20000, IsPercent = false, MinimumOrderAmount = 50000
            };
            db.Vouchers.Add(voucher);
            await db.SaveChangesAsync();

            // Act
            var result = await service.ValidateVoucherAsync("FIXED", 1, 80000);

            // Assert
            Assert.True(result.IsValid);
            Assert.Equal(20000, result.DiscountAmount);
        }

        [Fact]
        public async Task ValidateVoucherAsync_PercentageDiscount_CalculatesCorrectly()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new VoucherApiService(db);

            var voucher = new Voucher
            {
                Code = "PERCENT", IsActive = true, ExpiryDate = DateTime.Now.AddDays(5),
                DiscountValue = 15, IsPercent = true, MinimumOrderAmount = 50000
            };
            db.Vouchers.Add(voucher);
            await db.SaveChangesAsync();

            // Act
            var result = await service.ValidateVoucherAsync("PERCENT", 1, 80000);

            // Assert
            Assert.True(result.IsValid);
            Assert.Equal(12000, result.DiscountAmount); // 80000 * 0.15 = 12000
        }

        [Fact]
        public async Task ValidateVoucherAsync_DiscountExceedsSubtotal_CapsDiscountToSubtotal()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new VoucherApiService(db);

            var voucher = new Voucher
            {
                Code = "BIGDISCOUNT", IsActive = true, ExpiryDate = DateTime.Now.AddDays(5),
                DiscountValue = 100000, IsPercent = false, MinimumOrderAmount = 30000
            };
            db.Vouchers.Add(voucher);
            await db.SaveChangesAsync();

            // Act
            var result = await service.ValidateVoucherAsync("BIGDISCOUNT", 1, 50000);

            // Assert
            Assert.True(result.IsValid);
            Assert.Equal(50000, result.DiscountAmount); // Capped to 50000 instead of 100000
        }
    }
}
