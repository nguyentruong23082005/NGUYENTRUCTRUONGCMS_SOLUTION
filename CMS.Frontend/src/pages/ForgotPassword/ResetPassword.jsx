import React, { useState } from 'react';
import { Link, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import authApi from '../../api/authApi';
import styles from './ResetPassword.module.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Guard: không có token → redirect
  if (!token) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.resetPassword(token, password);
      setSuccess(response.data?.message || 'Đổi mật khẩu thành công!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <Helmet>
        <title>Đặt lại mật khẩu - Phúc Long Coffee &amp; Tea</title>
      </Helmet>

      <div className={styles.card}>
        <div className={styles.header}>
          <h2>ĐẶT LẠI MẬT KHẨU</h2>
          <p>Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {success && (
          <div className={styles.successAlert}>
            {success}
            <p style={{ marginTop: 8, fontSize: 13 }}>Tự động chuyển sang đăng nhập sau 3 giây...</p>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="new-password" className={styles.label}>Mật khẩu mới</label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className={styles.input}
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirm-password" className={styles.label}>Xác nhận mật khẩu</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className={styles.input}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'ĐANG XỬ LÝ...' : 'ĐẶT LẠI MẬT KHẨU'}
            </button>
          </form>
        )}

        <div className={styles.footerLink} style={{ marginTop: '20px' }}>
          <Link to="/login">← Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
