import { useState } from 'react';
import orderService from '../services/orderService';

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
      const data = await orderService.submitOrder(orderPayload);
      return data;
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
