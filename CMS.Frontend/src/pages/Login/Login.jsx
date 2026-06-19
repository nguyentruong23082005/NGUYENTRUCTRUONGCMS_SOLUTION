import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import authApi from '../../api/authApi';
import logo from '../../assets/images/logo.png';
import styles from './Login.module.css';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useCart();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập Email và Mật khẩu.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });

      if (response.data?.success && response.data?.data) {
        const { token, customer } = response.data.data;
        login(token, customer);
        showToast('Đăng nhập tài khoản thành công!');
        navigate('/');
      } else {
        setError(response.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Không đăng nhập được qua API:', err);
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <Helmet>
        <title>Đăng nhập - Phúc Long Coffee & Tea</title>
      </Helmet>

      <section className={styles.panel}>
        <Link to="/" className={styles.homeLink} aria-label="Về trang chủ">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 10.8 12 3l9 7.8v9.7a.5.5 0 0 1-.5.5h-5.2v-6.2H8.7V21H3.5a.5.5 0 0 1-.5-.5z" />
          </svg>
        </Link>

        <img src={logo} alt="Phúc Long" className={styles.logo} />
        <div className={styles.header}>
          <h1>Phúc Long Xin Chào</h1>
          <p>Đăng nhập tài khoản</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email*"
            className={styles.input}
            autoComplete="new-password"
            required
          />

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mật khẩu*"
            className={styles.input}
            autoComplete="new-password"
            required
          />

          <Link to="/forgot-password" className={styles.forgotLink}>Quên mật khẩu?</Link>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'ĐANG XÁC THỰC...' : 'TIẾP TỤC'}
          </button>
        </form>

        <div className={styles.footerLink}>
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </div>
      </section>
    </div>
  );
};

export default Login;
