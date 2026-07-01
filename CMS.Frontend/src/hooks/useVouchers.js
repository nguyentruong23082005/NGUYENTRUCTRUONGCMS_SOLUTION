import { useState } from 'react';
import voucherApi from '../api/voucherApi';

/**
 * Hook quản lý mã khuyến mãi từ API thật
 * @returns {{ getAvailableVouchers: Function, validateVoucher: Function, loading: boolean, error: string|null }}
 */
export const useVouchers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy danh sách tất cả voucher khả dụng từ API
  const getAvailableVouchers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await voucherApi.getAll();
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      return [];
    } catch (err) {
      console.error('Lỗi khi tải danh sách voucher:', err);
      setError('Không thể tải danh sách ưu đãi.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra tính hợp lệ của một mã voucher
  const validateVoucher = async (code, orderSubtotal = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await voucherApi.validate(code, orderSubtotal);
      return response.data;
    } catch (err) {
      console.error('Lỗi khi kiểm tra mã khuyến mãi:', err);
      setError('Mã khuyến mãi không hợp lệ hoặc đã hết hạn.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getAvailableVouchers, validateVoucher, loading, error };
};

export default useVouchers;
