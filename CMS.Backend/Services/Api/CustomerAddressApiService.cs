using CMS.Backend.Models.Dtos;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CMS.Backend.Services.Api
{
    public sealed class CustomerAddressApiService : ICustomerAddressApiService
    {
        private readonly ApplicationDbContext _db;

        public CustomerAddressApiService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<IReadOnlyCollection<CustomerAddressDto>> GetAddressesAsync(int customerId)
        {
            var addresses = await _db.CustomerAddresses
                .Where(a => a.CustomerId == customerId)
                .OrderByDescending(a => a.IsDefault)
                .ThenByDescending(a => a.CreatedAt)
                .Select(a => new CustomerAddressDto
                {
                    Id = a.Id,
                    ReceiverName = a.ReceiverName,
                    ReceiverPhone = a.ReceiverPhone,
                    AddressLine = a.AddressLine,
                    Province = a.Province,
                    District = a.District,
                    Ward = a.Ward,
                    AddressType = a.AddressType,
                    IsDefault = a.IsDefault,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync();

            return addresses.AsReadOnly();
        }

        public async Task<CustomerAddressDto?> GetAddressByIdAsync(int customerId, int addressId)
        {
            var address = await _db.CustomerAddresses
                .FirstOrDefaultAsync(a => a.Id == addressId && a.CustomerId == customerId);

            if (address == null) return null;

            return new CustomerAddressDto
            {
                Id = address.Id,
                ReceiverName = address.ReceiverName,
                ReceiverPhone = address.ReceiverPhone,
                AddressLine = address.AddressLine,
                Province = address.Province,
                District = address.District,
                Ward = address.Ward,
                AddressType = address.AddressType,
                IsDefault = address.IsDefault,
                CreatedAt = address.CreatedAt
            };
        }

        public async Task<CustomerAddressDto> CreateAddressAsync(int customerId, CreateAddressDto dto)
        {
            // Kiểm tra xem khách hàng đã có địa chỉ nào chưa
            var hasAnyAddress = await _db.CustomerAddresses.AnyAsync(a => a.CustomerId == customerId);
            
            // Nếu là địa chỉ đầu tiên hoặc được chỉ định làm mặc định, đặt IsDefault = true
            bool isDefault = dto.IsDefault || !hasAnyAddress;

            if (isDefault)
            {
                // Gỡ cờ mặc định của các địa chỉ cũ
                var otherDefaults = await _db.CustomerAddresses
                    .Where(a => a.CustomerId == customerId && a.IsDefault)
                    .ToListAsync();

                foreach (var addr in otherDefaults)
                {
                    addr.IsDefault = false;
                }
            }

            var address = new CustomerAddress
            {
                CustomerId = customerId,
                ReceiverName = dto.ReceiverName.Trim(),
                ReceiverPhone = dto.ReceiverPhone.Trim(),
                AddressLine = dto.AddressLine.Trim(),
                Province = dto.Province.Trim(),
                District = dto.District.Trim(),
                Ward = dto.Ward.Trim(),
                AddressType = dto.AddressType.Trim(),
                IsDefault = isDefault
            };

            _db.CustomerAddresses.Add(address);
            await _db.SaveChangesAsync();

            return new CustomerAddressDto
            {
                Id = address.Id,
                ReceiverName = address.ReceiverName,
                ReceiverPhone = address.ReceiverPhone,
                AddressLine = address.AddressLine,
                Province = address.Province,
                District = address.District,
                Ward = address.Ward,
                AddressType = address.AddressType,
                IsDefault = address.IsDefault,
                CreatedAt = address.CreatedAt
            };
        }

        public async Task<CustomerAddressDto?> UpdateAddressAsync(int customerId, int addressId, CreateAddressDto dto)
        {
            var address = await _db.CustomerAddresses
                .FirstOrDefaultAsync(a => a.Id == addressId && a.CustomerId == customerId);

            if (address == null) return null;

            if (dto.IsDefault && !address.IsDefault)
            {
                // Gỡ cờ mặc định của các địa chỉ khác
                var otherDefaults = await _db.CustomerAddresses
                    .Where(a => a.CustomerId == customerId && a.IsDefault && a.Id != addressId)
                    .ToListAsync();

                foreach (var addr in otherDefaults)
                {
                    addr.IsDefault = false;
                }
                address.IsDefault = true;
            }
            else if (!dto.IsDefault && address.IsDefault)
            {
                // Nếu địa chỉ đang là mặc định nhưng cập nhật thành không mặc định,
                // ta chỉ cho phép nếu có một địa chỉ khác làm mặc định, hoặc giữ nguyên làm mặc định nếu là duy nhất.
                var hasOtherAddresses = await _db.CustomerAddresses
                    .AnyAsync(a => a.CustomerId == customerId && a.Id != addressId);

                if (!hasOtherAddresses)
                {
                    address.IsDefault = true; // Bắt buộc mặc định nếu là duy nhất
                }
                else
                {
                    address.IsDefault = false;
                    // Tự động gán mặc định cho một địa chỉ khác (địa chỉ gần nhất)
                    var latestAddress = await _db.CustomerAddresses
                        .Where(a => a.CustomerId == customerId && a.Id != addressId)
                        .OrderByDescending(a => a.CreatedAt)
                        .FirstOrDefaultAsync();

                    if (latestAddress != null)
                    {
                        latestAddress.IsDefault = true;
                    }
                }
            }

            address.ReceiverName = dto.ReceiverName.Trim();
            address.ReceiverPhone = dto.ReceiverPhone.Trim();
            address.AddressLine = dto.AddressLine.Trim();
            address.Province = dto.Province.Trim();
            address.District = dto.District.Trim();
            address.Ward = dto.Ward.Trim();
            address.AddressType = dto.AddressType.Trim();
            address.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return new CustomerAddressDto
            {
                Id = address.Id,
                ReceiverName = address.ReceiverName,
                ReceiverPhone = address.ReceiverPhone,
                AddressLine = address.AddressLine,
                Province = address.Province,
                District = address.District,
                Ward = address.Ward,
                AddressType = address.AddressType,
                IsDefault = address.IsDefault,
                CreatedAt = address.CreatedAt
            };
        }

        public async Task<bool> DeleteAddressAsync(int customerId, int addressId)
        {
            var address = await _db.CustomerAddresses
                .FirstOrDefaultAsync(a => a.Id == addressId && a.CustomerId == customerId);

            if (address == null) return false;

            bool wasDefault = address.IsDefault;

            _db.CustomerAddresses.Remove(address);
            await _db.SaveChangesAsync();

            // Nếu địa chỉ vừa xóa là mặc định, ta đặt mặc định cho địa chỉ còn lại gần nhất
            if (wasDefault)
            {
                var latestAddress = await _db.CustomerAddresses
                    .Where(a => a.CustomerId == customerId)
                    .OrderByDescending(a => a.CreatedAt)
                    .FirstOrDefaultAsync();

                if (latestAddress != null)
                {
                    latestAddress.IsDefault = true;
                    await _db.SaveChangesAsync();
                }
            }

            return true;
        }

        public async Task<bool> SetDefaultAddressAsync(int customerId, int addressId)
        {
            var address = await _db.CustomerAddresses
                .FirstOrDefaultAsync(a => a.Id == addressId && a.CustomerId == customerId);

            if (address == null) return false;

            if (address.IsDefault) return true; // Đã là mặc định sẵn

            // Gỡ cờ mặc định của các địa chỉ khác
            var otherDefaults = await _db.CustomerAddresses
                .Where(a => a.CustomerId == customerId && a.IsDefault)
                .ToListAsync();

            foreach (var addr in otherDefaults)
            {
                addr.IsDefault = false;
            }

            address.IsDefault = true;
            address.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return true;
        }
    }
}
