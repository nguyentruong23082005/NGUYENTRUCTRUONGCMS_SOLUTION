import axiosClient from './axiosClient';

// API quản lý hệ thống cửa hàng Phúc Long
export const storeApi = {
  getAll: () => {
    return axiosClient.get('/api/stores');
  }
};

export default storeApi;
