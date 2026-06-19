import axios from 'axios';
import { STORAGE_KEYS } from '../utils/constants';

// Khởi tạo Axios client instance (Cấu hình qua file môi trường .env)
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7296',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Bộ chặn Request: tự động chèn JWT token từ localStorage vào HTTP Header Authorization
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Bộ chặn Response: xử lý lỗi toàn cục từ máy chủ
// Nếu máy chủ trả về mã trạng thái 401 Unauthorized, dọn sạch localStorage và chuyển hướng về trang đăng nhập
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
