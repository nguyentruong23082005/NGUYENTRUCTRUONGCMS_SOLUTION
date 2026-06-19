import { useState } from 'react';
import customerService from '../services/customerService';
import customerApi from '../api/customerApi';
import customerAddressApi from '../api/customerAddressApi';

/**
 * Hook quản lý thông tin khách hàng và sổ địa chỉ từ API thật
 */
export const useCustomers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy thông tin hồ sơ: GET /api/Customers/profile
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

  // Cập nhật hồ sơ: PUT /api/Customers/profile
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

  // Lấy danh sách địa chỉ: GET /api/customers/addresses
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

  // Thêm địa chỉ mới: POST /api/customers/addresses
  const createAddress = async (addressData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerAddressApi.create(addressData);
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Lỗi khi thêm địa chỉ:', err);
      setError('Không thể thêm địa chỉ.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật địa chỉ: PUT /api/customers/addresses/{id}
  const updateAddress = async (id, addressData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerAddressApi.update(id, addressData);
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Lỗi khi cập nhật địa chỉ:', err);
      setError('Không thể cập nhật địa chỉ.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Xóa địa chỉ: DELETE /api/customers/addresses/{id}
  const deleteAddress = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerAddressApi.remove(id);
      return response.data?.success === true;
    } catch (err) {
      console.error('Lỗi khi xóa địa chỉ:', err);
      setError('Không thể xóa địa chỉ.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Thiết lập địa chỉ mặc định: POST /api/customers/addresses/{id}/set-default
  const setDefaultAddress = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerAddressApi.setDefault(id);
      return response.data?.success === true;
    } catch (err) {
      console.error('Lỗi khi thiết lập địa chỉ mặc định:', err);
      setError('Không thể thiết lập địa chỉ mặc định.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getProfile,
    updateProfile,
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    loading,
    error
  };
};

export default useCustomers;
