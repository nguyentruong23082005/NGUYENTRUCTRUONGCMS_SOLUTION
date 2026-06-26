import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import authApi from '../../api/authApi';
import styles from './ForgotPassword.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ Email.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.forgotPassword(email.trim());
      setSuccess(response.data?.message || 'Nếu email tồn tại, hệ thống đã gửi hướng dẫn khôi phục.');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <Helmet>
        <title>Quên mật khẩu - Phúc Long Coffee &amp; Tea</title>
      </Helmet>

      <div className={styles.card}>
        <div className={styles.header}>
          <h2>QUÊN MẬT KHẨU</h2>
          <p>Nhập email đăng ký tài khoản để nhận hướng dẫn lấy lại mật khẩu</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {success && <div className={styles.successAlert}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="forgot-email" className={styles.label}>Địa chỉ Email đăng ký</label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Nhập email của bạn"
              className={styles.input}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'ĐANG GỬI...' : 'GỬI YÊU CẦU KHÔI PHỤC'}
          </button>
        </form>

        <div className={styles.footerLink} style={{ marginTop: '20px' }}>
          Nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
