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
    public sealed class VoucherApiService : IVoucherApiService
    {
        private readonly ApplicationDbContext _db;

        public VoucherApiService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<IReadOnlyCollection<VoucherDto>> GetAvailableVouchersAsync()
        {
            var now = DateTime.Now;
            var vouchers = await _db.Vouchers
                .Where(v => v.IsActive && v.ExpiryDate >= now)
                .OrderBy(v => v.ExpiryDate)
                .Select(v => new VoucherDto
                {
                    Id = v.Id,
                    Code = v.Code,
                    DiscountValue = v.DiscountValue,
                    IsPercent = v.IsPercent,
                    MinimumOrderAmount = v.MinimumOrderAmount,
                    ExpiryDate = v.ExpiryDate
                })
                .ToListAsync();

            return vouchers.AsReadOnly();
        }

        public async Task<VoucherValidationResultDto> ValidateVoucherAsync(string code, int customerId, decimal orderSubtotal)
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                return new VoucherValidationResultDto
                {
                    IsValid = false,
                    Message = "Mã giảm giá không được để trống."
                };
            }

            var codeUpper = code.Trim().ToUpper();
            var voucher = await _db.Vouchers
                .FirstOrDefaultAsync(v => v.Code.ToUpper() == codeUpper);

            if (voucher == null)
            {
                return new VoucherValidationResultDto
                {
                    IsValid = false,
                    Message = "Mã giảm giá không tồn tại."
                };
            }

            if (!voucher.IsActive)
            {
                return new VoucherValidationResultDto
                {
                    IsValid = false,
                    Message = "Mã giảm giá đã bị ngưng hoạt động."
                };
            }

            if (voucher.ExpiryDate < DateTime.Now)
            {
                return new VoucherValidationResultDto
                {
                    IsValid = false,
                    Message = "Mã giảm giá đã hết hạn sử dụng."
                };
            }

            // Kiểm tra xem khách hàng đã sử dụng voucher này chưa
            var isUsed = await _db.CustomerVouchers
                .AnyAsync(cv => cv.CustomerId == customerId && cv.VoucherId == voucher.Id && cv.IsUsed);

            if (isUsed)
            {
                return new VoucherValidationResultDto
                {
                    IsValid = false,
                    Message = "Bạn đã sử dụng mã giảm giá này rồi."
                };
            }

            if (orderSubtotal < voucher.MinimumOrderAmount)
            {
                return new VoucherValidationResultDto
                {
                    IsValid = false,
                    Message = $"Đơn hàng tối thiểu phải đạt {voucher.MinimumOrderAmount:N0}đ để áp dụng."
                };
            }

            // Tính toán số tiền giảm giá
            decimal discountAmount = 0;
            if (voucher.IsPercent)
            {
                discountAmount = orderSubtotal * (voucher.DiscountValue / 100);
            }
            else
            {
                discountAmount = voucher.DiscountValue;
            }

            // Số tiền giảm không vượt quá tổng tiền hàng
            if (discountAmount > orderSubtotal)
            {
                discountAmount = orderSubtotal;
            }

            return new VoucherValidationResultDto
            {
                IsValid = true,
                DiscountAmount = discountAmount,
                Message = "Áp dụng mã giảm giá thành công.",
                Voucher = new VoucherDto
                {
                    Id = voucher.Id,
                    Code = voucher.Code,
                    DiscountValue = voucher.DiscountValue,
                    IsPercent = voucher.IsPercent,
                    MinimumOrderAmount = voucher.MinimumOrderAmount,
                    ExpiryDate = voucher.ExpiryDate
                }
            };
        }
    }
}
