import axiosClient from './axiosClient';

// API quản lý danh sách địa chỉ nhận hàng của khách hàng
export const customerAddressApi = {
  getAll: () => {
    return axiosClient.get('/api/customers/addresses');
  },
  getById: (id) => {
    return axiosClient.get(`/api/customers/addresses/${id}`);
  },
  create: (addressData) => {
    return axiosClient.post('/api/customers/addresses', addressData);
  },
  update: (id, addressData) => {
    return axiosClient.put(`/api/customers/addresses/${id}`, addressData);
  },
  remove: (id) => {
    return axiosClient.delete(`/api/customers/addresses/${id}`);
  },
  setDefault: (id) => {
    return axiosClient.post(`/api/customers/addresses/${id}/set-default`);
  }
};

export default customerAddressApi;
