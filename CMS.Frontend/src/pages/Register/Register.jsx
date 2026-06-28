import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';
import logo from '../../assets/images/logo.png';
import { isValidEmail, isValidPhone } from '../../utils/validators';
import styles from './Register.module.css';
import { auth } from '../../utils/firebase';
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

// Trang đăng ký tài khoản khách hàng mới
const Register = () => {
  const { showToast } = useCart();
  const { login } = useAuth();
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

    const trimmedEmail = email.trim();

    if (!isValidEmail(trimmedEmail)) {
      setError('Email không hợp lệ. Vui lòng nhập đúng định dạng, ví dụ: ten@example.com.');
      return;
    }

    const trimmedPhone = phone.trim();

    if (trimmedPhone && !isValidPhone(trimmedPhone)) {
      setError('Số điện thoại không hợp lệ (yêu cầu 10-11 chữ số).');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Gọi API Backend thật để đăng ký tài khoản qua authApi
      const response = await authApi.register({
        fullName: fullName.trim(),
        email: trimmedEmail,
        phone: trimmedPhone || null,
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

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      const response = await authApi.socialLogin(idToken);
      if (response.data?.success && response.data?.data) {
        const { token, customer } = response.data.data;
        login(token, customer);
        showToast('Đăng nhập bằng Google thành công!');
        navigate('/', { replace: true });
      } else {
        setError(response.data?.message || 'Đăng nhập thất bại.');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập Google:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Cửa sổ đăng nhập đã bị đóng.');
      } else if (err.code === 'auth/configuration-not-found') {
        setError('Cấu hình Firebase Authentication chưa được thiết lập chính xác.');
      } else {
        setError(err.response?.data?.message || err.message || 'Đăng nhập Google thất bại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      const response = await authApi.socialLogin(idToken);
      if (response.data?.success && response.data?.data) {
        const { token, customer } = response.data.data;
        login(token, customer);
        showToast('Đăng nhập bằng Facebook thành công!');
        navigate('/', { replace: true });
      } else {
        setError(response.data?.message || 'Đăng nhập thất bại.');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập Facebook:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Cửa sổ đăng nhập đã bị đóng.');
      } else {
        setError(err.response?.data?.message || err.message || 'Đăng nhập Facebook thất bại.');
      }
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
            <input
              id="reg-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder=" "
              className={styles.input}
              autoComplete="new-password"
              required
            />
            <label htmlFor="reg-fullname" className={styles.floatingLabel}>Họ và tên*</label>
          </div>

          <div className={styles.formGroup}>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              className={styles.input}
              autoComplete="new-password"
              required
            />
            <label htmlFor="reg-email" className={styles.floatingLabel}>Địa chỉ Email*</label>
          </div>

          <div className={styles.formGroup}>
            <input
              id="reg-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder=" "
              className={styles.input}
              autoComplete="new-password"
            />
            <label htmlFor="reg-phone" className={styles.floatingLabel}>Số điện thoại (tùy chọn)</label>
          </div>

          <div className={styles.formGroup}>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              className={styles.input}
              autoComplete="new-password"
              required
            />
            <label htmlFor="reg-password" className={styles.floatingLabel}>Mật khẩu* (tối thiểu 6 ký tự)</label>
          </div>

          <div className={styles.formGroup}>
            <input
              id="reg-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder=" "
              className={styles.input}
              autoComplete="new-password"
              required
            />
            <label htmlFor="reg-confirm" className={styles.floatingLabel}>Xác nhận mật khẩu*</label>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'ĐĂNG KÝ'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>hoặc đăng ký bằng</span>
        </div>

        <div className={styles.socialButtons}>
          <button 
            type="button" 
            onClick={handleGoogleLogin} 
            className={styles.googleBtn}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" className={styles.socialSvg} xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button 
            type="button" 
            onClick={handleFacebookLogin} 
            className={styles.facebookBtn}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" className={styles.socialSvg} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>

        <div className={styles.footerLink}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </section>
    </div>
  );
};

export default Register;
