import axiosClient from './axiosClient';

// API quản lý đơn đặt hàng
export const orderApi = {
  create: (orderData) => {
    return axiosClient.post('/api/orders', orderData);
  },
  getHistory: (params = {}) => {
    return axiosClient.get('/api/orders', { params });
  },
  getById: (id) => {
    return axiosClient.get(`/api/orders/${id}`);
  },
  cancel: (id) => {
    return axiosClient.post(`/api/orders/${id}/cancel`);
  },
  getShippingProvinces: () => {
    return axiosClient.get('/api/orders/shipping/provinces');
  },
  getShippingDistricts: (provinceId) => {
    return axiosClient.get('/api/orders/shipping/districts', { params: { provinceId } });
  },
  getShippingWards: (districtId) => {
    return axiosClient.get('/api/orders/shipping/wards', { params: { districtId } });
  },
  calculateShippingFee: (districtId, wardCode, storeId) => {
    return axiosClient.get('/api/orders/shipping/fee', { params: { districtId, wardCode, storeId } });
  }
};

export default orderApi;
