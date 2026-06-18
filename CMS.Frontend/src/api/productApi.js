import axiosClient from './axiosClient';

// API quản lý sản phẩm
export const productApi = {
  getAll: (params) => {
    return axiosClient.get('/api/products', { params });
  },
  getById: (id) => {
    return axiosClient.get(`/api/products/${id}`);
  }
};

export default productApi;
