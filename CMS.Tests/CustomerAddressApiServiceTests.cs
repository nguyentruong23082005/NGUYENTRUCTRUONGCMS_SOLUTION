using CMS.Backend.Models.Dtos;
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
    public class CustomerAddressApiServiceTests
    {
        private ApplicationDbContext CreateInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task CreateAddressAsync_FirstAddress_MustBeDefault()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new CustomerAddressApiService(db);
            int customerId = 1;

            var dto = new CreateAddressDto
            {
                ReceiverName = "Nguyen Van A",
                ReceiverPhone = "0901234567",
                AddressLine = "123 Main St",
                Province = "Hồ Chí Minh",
                District = "Quận 1",
                Ward = "Phường Bến Nghé",
                AddressType = "Nhà riêng",
                IsDefault = false // Even if requested false, first address must be default
            };

            // Act
            var result = await service.CreateAddressAsync(customerId, dto);

            // Assert
            Assert.True(result.IsDefault);

            var addressInDb = await db.CustomerAddresses.FindAsync(result.Id);
            Assert.NotNull(addressInDb);
            Assert.True(addressInDb.IsDefault);
        }

        [Fact]
        public async Task CreateAddressAsync_NewDefaultAddress_ResetsOtherDefaults()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new CustomerAddressApiService(db);
            int customerId = 1;

            // Add an existing default address
            var addr1 = new CustomerAddress
            {
                CustomerId = customerId,
                ReceiverName = "Nguyen Van A",
                ReceiverPhone = "0901234567",
                AddressLine = "123 Old St",
                Province = "HCM",
                District = "Q1",
                Ward = "P1",
                AddressType = "Home",
                IsDefault = true
            };
            db.CustomerAddresses.Add(addr1);
            await db.SaveChangesAsync();

            var dto = new CreateAddressDto
            {
                ReceiverName = "Nguyen Van B",
                ReceiverPhone = "0908888888",
                AddressLine = "456 New St",
                Province = "HCM",
                District = "Q3",
                Ward = "P5",
                AddressType = "Work",
                IsDefault = true
            };

            // Act
            var result = await service.CreateAddressAsync(customerId, dto);

            // Assert
            Assert.True(result.IsDefault);

            var oldAddress = await db.CustomerAddresses.FindAsync(addr1.Id);
            Assert.NotNull(oldAddress);
            Assert.False(oldAddress.IsDefault); // Old address must be unset
        }

        [Fact]
        public async Task UpdateAddressAsync_SetDefaultToFalseOnOnlyAddress_KeepsItDefault()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new CustomerAddressApiService(db);
            int customerId = 1;

            var addr1 = new CustomerAddress
            {
                CustomerId = customerId,
                ReceiverName = "Nguyen Van A",
                ReceiverPhone = "0901234567",
                AddressLine = "123 Old St",
                Province = "HCM",
                District = "Q1",
                Ward = "P1",
                AddressType = "Home",
                IsDefault = true
            };
            db.CustomerAddresses.Add(addr1);
            await db.SaveChangesAsync();

            var dto = new CreateAddressDto
            {
                ReceiverName = "Nguyen Van A",
                ReceiverPhone = "0901234567",
                AddressLine = "123 Old St",
                Province = "HCM",
                District = "Q1",
                Ward = "P1",
                AddressType = "Home",
                IsDefault = false // Try to turn off default
            };

            // Act
            var result = await service.UpdateAddressAsync(customerId, addr1.Id, dto);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.IsDefault); // Should remain default since it's the only address
        }

        [Fact]
        public async Task DeleteAddressAsync_DefaultAddressDeleted_SetsNextAddressAsDefault()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new CustomerAddressApiService(db);
            int customerId = 1;

            var addrDefault = new CustomerAddress
            {
                CustomerId = customerId,
                ReceiverName = "Nguyen Van A",
                ReceiverPhone = "0901234567",
                AddressLine = "123 Default St",
                Province = "HCM",
                District = "Q1",
                Ward = "P1",
                AddressType = "Home",
                IsDefault = true,
                CreatedAt = DateTime.UtcNow.AddMinutes(-5)
            };

            var addrSecondary = new CustomerAddress
            {
                CustomerId = customerId,
                ReceiverName = "Nguyen Van B",
                ReceiverPhone = "0907654321",
                AddressLine = "456 Second St",
                Province = "HCM",
                District = "Q3",
                Ward = "P2",
                AddressType = "Work",
                IsDefault = false,
                CreatedAt = DateTime.UtcNow
            };

            db.CustomerAddresses.AddRange(addrDefault, addrSecondary);
            await db.SaveChangesAsync();

            // Act
            var success = await service.DeleteAddressAsync(customerId, addrDefault.Id);

            // Assert
            Assert.True(success);
            var secondaryInDb = await db.CustomerAddresses.FindAsync(addrSecondary.Id);
            Assert.NotNull(secondaryInDb);
            Assert.True(secondaryInDb.IsDefault); // Secondary address must be set to default
        }

        [Fact]
        public async Task SetDefaultAddressAsync_UpdatesCorrectly()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new CustomerAddressApiService(db);
            int customerId = 1;

            var addr1 = new CustomerAddress
            {
                CustomerId = customerId,
                ReceiverName = "A", ReceiverPhone = "1", AddressLine = "L1", Province = "P", District = "D", Ward = "W", AddressType = "T",
                IsDefault = true
            };
            var addr2 = new CustomerAddress
            {
                CustomerId = customerId,
                ReceiverName = "B", ReceiverPhone = "2", AddressLine = "L2", Province = "P", District = "D", Ward = "W", AddressType = "T",
                IsDefault = false
            };

            db.CustomerAddresses.AddRange(addr1, addr2);
            await db.SaveChangesAsync();

            // Act
            var success = await service.SetDefaultAddressAsync(customerId, addr2.Id);

            // Assert
            Assert.True(success);
            var a1 = await db.CustomerAddresses.FindAsync(addr1.Id);
            var a2 = await db.CustomerAddresses.FindAsync(addr2.Id);
            Assert.False(a1!.IsDefault);
            Assert.True(a2!.IsDefault);
        }
    }
}
