using CMS.Backend.Models.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CMS.Backend.Services.Api
{
    public interface IVoucherApiService
    {
        Task<IReadOnlyCollection<VoucherDto>> GetAvailableVouchersAsync();
        Task<VoucherValidationResultDto> ValidateVoucherAsync(string code, int customerId, decimal orderSubtotal);
    }
}
