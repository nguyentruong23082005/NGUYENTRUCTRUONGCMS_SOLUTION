import { useState } from 'react';
import orderApi from '../api/orderApi';

/**
 * Hook quản lý tạo đơn hàng qua API thật
 * @returns {{ createOrder: Function, loading: boolean, error: string|null }}
 */
export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = async (orderPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderApi.create(orderPayload);
      return response.data;
    } catch (err) {
      console.error('Lỗi khi tạo đơn hàng:', err);
      setError('Không thể tạo đơn hàng. Vui lòng thử lại sau.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createOrder, loading, error };
};

export default useOrders;
