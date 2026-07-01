using CMS.Backend.Models.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CMS.Backend.Services.Api
{
    public interface IOrderApiService
    {
        Task<OrderDto> PlaceOrderAsync(int customerId, PlaceOrderDto dto, bool suppressEmail = false);
        Task<IReadOnlyCollection<OrderDto>> GetOrderHistoryAsync(int customerId, OrderHistoryQuery query);
        Task<OrderDto?> GetOrderDetailsAsync(int customerId, int orderId);
        Task<bool> CancelOrderAsync(int customerId, int orderId);
        Task RollbackOrderAsync(int orderId);
    }
}
