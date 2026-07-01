import customerApi from '../api/customerApi';
import customerAddressApi from '../api/customerAddressApi';

/**
 * Service xử lý logic nghiệp vụ khách hàng
 * Bao gồm lấy thông tin cá nhân và danh sách địa chỉ giao hàng
 */

// Lấy thông tin hồ sơ khách hàng
export const getCustomerProfile = async () => {
  const response = await customerApi.getProfile();
  if (response.data?.success && response.data?.data) {
    return response.data.data;
  }
  return null;
};

// Lấy danh sách địa chỉ giao hàng của khách hàng
export const getCustomerAddresses = async () => {
  const response = await customerAddressApi.getAll();
  if (response.data?.success && response.data?.data) {
    return response.data.data;
  }
  return [];
};

export default { getCustomerProfile, getCustomerAddresses };
