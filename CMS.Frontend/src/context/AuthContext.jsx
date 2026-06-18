import React, { createContext, useContext, useState, useEffect } from 'react';

// Context quản lý trạng thái xác thực khách hàng (Đăng nhập, Đăng ký, Đăng xuất)
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Khôi phục trạng thái đăng nhập từ localStorage khi khách hàng tải lại trang (F5)
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // Xóa sạch dữ liệu lỗi nếu cấu trúc JSON lưu trữ bị hỏng
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Hàm thực hiện đăng nhập và lưu trữ token JWT nhận từ Backend
  const login = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Hàm thực hiện đăng xuất, xóa bỏ toàn bộ phiên làm việc khỏi trình duyệt
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
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
