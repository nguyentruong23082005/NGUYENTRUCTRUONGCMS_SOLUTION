import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../../context/CartContext';
import authApi from '../../api/authApi';
import logo from '../../assets/images/logo.png';
import styles from './Register.module.css';

// Trang đăng ký tài khoản khách hàng mới
const Register = () => {
  const { showToast } = useCart();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Gọi API Backend thật để đăng ký tài khoản qua authApi
      const response = await authApi.register({
        fullName,
        email,
        phone: phone || null,
        password
      });

      if (response.data && response.data.success) {
        showToast('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        setError(response.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Lỗi khi gọi API đăng ký:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <Helmet>
        <title>Đăng ký tài khoản - Phúc Long Coffee & Tea</title>
      </Helmet>

      <section className={styles.panel}>
        <img src={logo} alt="Phúc Long" className={styles.logo} />
        <div className={styles.header}>
          <h1>Phúc Long Xin Chào</h1>
          <p>Tạo tài khoản mới</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
          <div className={styles.formGroup}>
            <label htmlFor="reg-fullname" className={styles.label}>Họ và tên</label>
            <input
              id="reg-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên"
              className={styles.input}
              autoComplete="new-password"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="reg-email" className={styles.label}>Địa chỉ Email</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className={styles.input}
              autoComplete="new-password"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="reg-phone" className={styles.label}>Số điện thoại</label>
            <input
              id="reg-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại (tùy chọn)"
              className={styles.input}
              autoComplete="new-password"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="reg-password" className={styles.label}>Mật khẩu (tối thiểu 6 ký tự)</label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className={styles.input}
              autoComplete="new-password"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="reg-confirm" className={styles.label}>Xác nhận mật khẩu</label>
            <input
              id="reg-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              className={styles.input}
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'ĐĂNG KÝ'}
          </button>
        </form>

        <div className={styles.footerLink}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </section>
    </div>
  );
};

export default Register;
