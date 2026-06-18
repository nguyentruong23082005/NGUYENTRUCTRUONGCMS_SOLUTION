import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import styles from './Profile.module.css'; // Keep css import or update if needed

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.unauthenticatedCard}>
            <h3>Vui lòng đăng nhập</h3>
            <p>Bạn cần đăng nhập để xem thông tin cá nhân và quản lý đơn hàng.</p>
            <button 
              type="button" 
              onClick={() => navigate('/login')} 
              className={styles.loginBtn}
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Hồ sơ của tôi - Phúc Long Coffee & Tea</title>
      </Helmet>

      <div className="container">
        <h1 className={styles.pageTitle}>Hồ Sơ Cá Nhân</h1>
        
        <div className={styles.card}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>👤</div>
            <h3>{user.fullName || user.userName}</h3>
            <p className={styles.role}>Khách hàng thành viên</p>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.infoGroup}>
              <span className={styles.infoLabel}>Tên tài khoản:</span>
              <span className={styles.infoValue}>{user.userName}</span>
            </div>
            
            <div className={styles.infoGroup}>
              <span className={styles.infoLabel}>Địa chỉ Email:</span>
              <span className={styles.infoValue}>{user.email}</span>
            </div>

            <div className={styles.infoGroup}>
              <span className={styles.infoLabel}>Số điện thoại:</span>
              <span className={styles.infoValue}>{user.phoneNumber || 'Chưa cập nhật'}</span>
            </div>

            <div className={styles.infoGroup}>
              <span className={styles.infoLabel}>Địa chỉ giao hàng mặc định:</span>
              <span className={styles.infoValue}>{user.address || 'Chưa cập nhật'}</span>
            </div>
            
            <div className={styles.actions}>
              <button 
                type="button" 
                onClick={logout} 
                className={styles.logoutBtn}
              >
                Đăng xuất tài khoản
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
