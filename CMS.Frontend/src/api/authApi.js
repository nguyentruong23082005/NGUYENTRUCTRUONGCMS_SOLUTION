import axiosClient from './axiosClient';

// API xác thực khách hàng (Đăng nhập, Đăng ký)
export const authApi = {
  login: (credentials) => {
    return axiosClient.post('/api/Customers/login', credentials);
  },
  register: (customerData) => {
    return axiosClient.post('/api/Customers/register', customerData);
  },
  forgotPassword: (email) => {
    return axiosClient.post('/api/Customers/forgot-password', { email });
  },
  resetPassword: (token, newPassword) => {
    return axiosClient.post('/api/Customers/reset-password', { token, newPassword });
  }
};

export default authApi;
