import { useState } from 'react';
import orderService from '../services/orderService';
import orderApi from '../api/orderApi';

/**
 * Hook quản lý đơn hàng từ API thật
 * @returns {{ createOrder, getOrderHistory, getOrderDetails, cancelOrder, loading, error }}
 */
export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tạo đơn hàng mới
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

  // Lấy danh sách lịch sử đơn hàng: GET /api/orders?page=...&pageSize=...
  const getOrderHistory = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderApi.getHistory(params);
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      return [];
    } catch (err) {
      console.error('Lỗi khi tải lịch sử đơn hàng:', err);
      setError('Không thể tải lịch sử đơn hàng.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Lấy chi tiết một đơn hàng theo ID: GET /api/orders/{id}
  const getOrderDetails = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderApi.getById(id);
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Lỗi khi tải chi tiết đơn hàng:', err);
      setError('Không thể tải chi tiết đơn hàng.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Hủy đơn hàng: POST /api/orders/{id}/cancel
  const cancelOrder = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderApi.cancel(id);
      return response.data;
    } catch (err) {
      console.error('Lỗi khi hủy đơn hàng:', err);
      setError('Không thể hủy đơn hàng.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createOrder, getOrderHistory, getOrderDetails, cancelOrder, loading, error };
};

export default useOrders;
