import { useState } from 'react';
import voucherApi from '../api/voucherApi';

/**
 * Hook quản lý mã khuyến mãi từ API thật
 * @returns {{ validateVoucher: Function, loading: boolean, error: string|null }}
 */
export const useVouchers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateVoucher = async (code) => {
    setLoading(true);
    setError(null);
    try {
      const response = await voucherApi.getByCode(code);
      return response.data;
    } catch (err) {
      console.error('Lỗi khi kiểm tra mã khuyến mãi:', err);
      setError('Mã khuyến mãi không hợp lệ hoặc đã hết hạn.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { validateVoucher, loading, error };
};

export default useVouchers;
