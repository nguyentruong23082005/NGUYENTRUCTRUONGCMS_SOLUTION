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
  }
};

export default orderApi;
