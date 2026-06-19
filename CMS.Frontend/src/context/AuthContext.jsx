import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

// Context quản lý trạng thái xác thực khách hàng (Đăng nhập, Đăng ký, Đăng xuất)
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Khôi phục trạng thái đăng nhập từ localStorage khi khách hàng tải lại trang (F5)
    const savedToken = storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const savedUser = storage.getItem(STORAGE_KEYS.USER);
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    } else {
      // Dọn dẹp trong trường hợp bị khuyết dữ liệu
      storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      storage.removeItem(STORAGE_KEYS.USER);
    }
    setLoading(false);
  }, []);

  // Hàm thực hiện đăng nhập và lưu trữ token JWT nhận từ Backend
  const login = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    storage.setItem(STORAGE_KEYS.AUTH_TOKEN, authToken);
    storage.setItem(STORAGE_KEYS.USER, userData);
  };

  // Hàm thực hiện đăng xuất, xóa bỏ toàn bộ phiên làm việc khỏi trình duyệt
  const logout = () => {
    setToken(null);
    setUser(null);
    storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    storage.removeItem(STORAGE_KEYS.USER);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
