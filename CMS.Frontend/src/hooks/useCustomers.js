import { useState } from 'react';
import customerService from '../services/customerService';
import customerApi from '../api/customerApi';

/**
 * Hook quản lý thông tin khách hàng từ API thật
 * @returns {{ getProfile: Function, getAddresses: Function, updateProfile: Function, loading: boolean, error: string|null }}
 */
export const useCustomers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy thông tin hồ sơ (dùng token trong header để xác định người dùng)
  const getProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getCustomerProfile();
      return data;
    } catch (err) {
      console.error('Lỗi khi tải thông tin khách hàng:', err);
      setError('Không thể tải thông tin khách hàng.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách địa chỉ giao hàng
  const getAddresses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getCustomerAddresses();
      return data;
    } catch (err) {
      console.error('Lỗi khi tải danh sách địa chỉ khách hàng:', err);
      setError('Không thể tải danh sách địa chỉ.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật thông tin hồ sơ
  const updateProfile = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerApi.updateProfile(data);
      return response.data;
    } catch (err) {
      console.error('Lỗi khi cập nhật thông tin khách hàng:', err);
      setError('Không thể cập nhật thông tin.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getProfile, getAddresses, updateProfile, loading, error };
};

export default useCustomers;
