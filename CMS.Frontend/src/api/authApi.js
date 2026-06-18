import axiosClient from './axiosClient';

// API xác thực khách hàng (Đăng nhập, Đăng ký)
export const authApi = {
  login: (credentials) => {
    return axiosClient.post('/api/Customers/login', credentials);
  },
  register: (customerData) => {
    return axiosClient.post('/api/Customers/register', customerData);
  }
};

export default authApi;
