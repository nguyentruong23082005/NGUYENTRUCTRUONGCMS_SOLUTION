import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import authApi from '../../api/authApi';
import logo from '../../assets/images/logo.png';
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

      <section className={styles.panel}>
        <img src={logo} alt="Phúc Long" className={styles.logo} />
        <div className={styles.header}>
          <h1>Phúc Long Xin Chào</h1>
          <p>Nhập email khôi phục mật khẩu</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {success && <div className={styles.successAlert}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
          <div className={styles.formGroup}>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Địa chỉ Email đăng ký*"
              className={styles.input}
              autoComplete="new-password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'ĐANG GỬI...' : 'GỬI YÊU CẦU KHÔI PHỤC'}
          </button>
        </form>

        <div className={styles.footerLink}>
          Nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;
