import axiosClient from './axiosClient';

// API quản lý hồ sơ thông tin khách hàng
export const customerApi = {
  getProfile: () => {
    return axiosClient.get('/api/Customers/profile');
  },
  updateProfile: (profileData) => {
    return axiosClient.put('/api/Customers/profile', profileData);
  }
};

export default customerApi;
