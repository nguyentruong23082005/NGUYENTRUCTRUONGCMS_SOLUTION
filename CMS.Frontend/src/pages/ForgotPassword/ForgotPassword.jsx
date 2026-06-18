import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styles from './ForgotPassword.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ Email.');
      return;
    }

    setError('Backend hiện chưa có API khôi phục mật khẩu, nên hệ thống chưa thể gửi email.');
  };

  return (
    <div className={styles.authPage}>
      <Helmet>
        <title>Quên mật khẩu - Phúc Long Coffee & Tea</title>
      </Helmet>

      <div className={styles.card}>
        <div className={styles.header}>
          <h2>QUÊN MẬT KHẨU</h2>
          <p>Nhập email đăng ký tài khoản để nhận hướng dẫn lấy lại mật khẩu</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

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
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            GỬI YÊU CẦU KHÔI PHỤC
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
