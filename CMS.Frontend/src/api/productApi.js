import axiosClient from './axiosClient';

// API quản lý sản phẩm
export const productApi = {
  getAll: (params) => {
    return axiosClient.get('/api/products', { params });
  },
  search: (params, config = {}) => {
    return axiosClient.get('/api/products/search', { params, ...config });
  },
  getById: (id) => {
    return axiosClient.get(`/api/products/${id}`);
  },
  getNewest: (count = 3) => {
    return axiosClient.get('/api/products/newest', { params: { count } });
  },
  getBestSellers: (count = 3) => {
    return axiosClient.get('/api/products/best-sellers', { params: { count } });
  }
};

export default productApi;
