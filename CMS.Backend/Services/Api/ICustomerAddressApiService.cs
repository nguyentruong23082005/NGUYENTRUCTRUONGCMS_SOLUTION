using CMS.Backend.Models.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CMS.Backend.Services.Api
{
    public interface ICustomerAddressApiService
    {
        Task<IReadOnlyCollection<CustomerAddressDto>> GetAddressesAsync(int customerId);
        Task<CustomerAddressDto?> GetAddressByIdAsync(int customerId, int addressId);
        Task<CustomerAddressDto> CreateAddressAsync(int customerId, CreateAddressDto dto);
        Task<CustomerAddressDto?> UpdateAddressAsync(int customerId, int addressId, CreateAddressDto dto);
        Task<bool> DeleteAddressAsync(int customerId, int addressId);
        Task<bool> SetDefaultAddressAsync(int customerId, int addressId);
    }
}
