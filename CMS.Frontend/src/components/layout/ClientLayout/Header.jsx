import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import categoryApi from '../../../api/categoryApi';
import logoImg from '../../../assets/images/logo.png';
import deliveryImg from '../../../assets/images/delivery-686d7142750173aa8bc5f1d11ea195e4.png';
import styles from './Header.module.css';

const normalizeCategory = (item) => ({
  id: String(item.id),
  name: item.name,
  slug: item.slug || '',
  children: (item.children || item.Children || []).map(normalizeCategory)
});

const getMenuPath = (category) => (
  category.slug ? `/menu/${category.slug}` : '/menu'
);

const toSentenceCase = (value = '') => {
  const normalized = value.trim().toLocaleLowerCase('vi-VN');
  if (!normalized) return '';
  return `${normalized.charAt(0).toLocaleUpperCase('vi-VN')}${normalized.slice(1)}`;
};

const AccountIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.headerSvgIcon}>
    <circle cx="12" cy="8" r="3.25" />
    <path d="M5.25 19.25c.85-3.65 3.3-5.5 6.75-5.5s5.9 1.85 6.75 5.5" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);

const AccountMenuIcon = ({ type }) => {
  if (type === 'register') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.accountMenuSvg}>
        <circle cx="10" cy="8" r="3" />
        <path d="M4 19c.7-3.1 2.8-4.6 6-4.6 1.3 0 2.4.25 3.3.78" />
        <path d="M18 11v6" />
        <path d="M15 14h6" />
      </svg>
    );
  }
  if (type === 'logout') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.accountMenuSvg}>
        <path d="M10 6H6.5A1.5 1.5 0 0 0 5 7.5v9A1.5 1.5 0 0 0 6.5 18H10" />
        <path d="M14 8l4 4-4 4" />
        <path d="M18 12H9" />
      </svg>
    );
  }
  if (type === 'vouchers') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.accountMenuSvg}>
        <rect x="2" y="7" width="20" height="10" rx="2" />
        <path d="M16 7v10" strokeDasharray="2 2" />
        <circle cx="16" cy="12" r="1.5" />
      </svg>
    );
  }
  if (type === 'addresses') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.accountMenuSvg}>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    );
  }
  if (type === 'orders') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.accountMenuSvg}>
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    );
  }
  // default: profile
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.accountMenuSvg}>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.25 19.25c.85-3.65 3.3-5.5 6.75-5.5s5.9 1.85 6.75 5.5" />
    </svg>
  );
};

// Header chính — thanh điều hướng trên cùng theo thiết kế Phúc Long
const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuCategories, setMenuCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenuCategories = async () => {
      try {
        const response = await categoryApi.getTree();
        const items = response?.data?.data || [];
        setMenuCategories(Array.isArray(items) ? items.map(normalizeCategory) : []);
      } catch (error) {
        console.error('Khong tai duoc danh muc menu tu API:', error);
        setMenuCategories([]);
      }
    };

    fetchMenuCategories();
  }, []);

  const dropdownCategories = useMemo(
    () => menuCategories.filter((category) => category.children.length > 0),
    [menuCategories]
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      {/* Dải trên: Logo + Tìm kiếm + Đăng nhập */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link to="/" className={styles.logoLink} aria-label="Về trang chủ">
            <img
              src={logoImg}
              alt="Phúc Long Coffee & Tea"
              className={styles.logoImage}
            />
          </Link>

          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <span className={styles.searchIcon} aria-hidden="true">⌕</span>
            <input
              type="text"
              placeholder="Bạn muốn mua gì..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Tìm kiếm sản phẩm"
            />
          </form>

          <div className={styles.headerSpacer} />

          <button type="button" className={styles.deliveryButton}>
            <img src={deliveryImg} alt="" className={styles.deliveryIcon} aria-hidden="true" />
            <span className={styles.deliveryTextGroup}>
              <strong>Giao Hàng</strong>
              <small>20 Tăng Nhơn Phú, Phước Long, H...</small>
            </span>
          </button>

          <div className={styles.controls}>
            <Link to="#" className={styles.iconButton} aria-label="Liên hệ">
              <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.headerSvgIcon}>
                <path d="M3.75 6.75h16.5v10.5H3.75V6.75Z" />
                <path d="m4.5 7.5 7.5 5.75 7.5-5.75" />
              </svg>
            </Link>

            <div className={styles.accountMenu}>
              <Link
                to={isAuthenticated ? '/customer/account' : '/login'}
                className={styles.iconButton}
                aria-label={isAuthenticated ? (user.fullName || user.userName || 'Tài khoản') : 'Đăng nhập'}
                aria-haspopup="true"
              >
                <AccountIcon />
              </Link>

              <div className={styles.accountDropdown}>
                {isAuthenticated ? (
                  <>
                    <Link to="/customer/account?tab=profile" className={styles.accountDropdownItem}>
                      <AccountMenuIcon type="profile" />
                      <span>Thông tin cá nhân</span>
                    </Link>
                    <Link to="/customer/account?tab=vouchers" className={styles.accountDropdownItem}>
                      <AccountMenuIcon type="vouchers" />
                      <span>Ưu đãi của tôi</span>
                    </Link>
                    <Link to="/customer/account?tab=addresses" className={styles.accountDropdownItem}>
                      <AccountMenuIcon type="addresses" />
                      <span>Số địa chỉ</span>
                    </Link>
                    <Link to="/customer/account?tab=orders" className={styles.accountDropdownItem}>
                      <AccountMenuIcon type="orders" />
                      <span>Đơn hàng</span>
                    </Link>
                    <button type="button" onClick={handleLogout} className={styles.accountDropdownItem}>
                      <AccountMenuIcon type="logout" />
                      <span>Đăng xuất</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className={`${styles.accountDropdownItem} ${styles.accountDropdownItemActive}`}>
                      <AccountMenuIcon type="profile" />
                      <span>Đăng nhập</span>
                    </Link>
                    <Link to="/register" className={styles.accountDropdownItem}>
                      <AccountMenuIcon type="register" />
                      <span>Đăng ký</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <nav className={styles.navBar}>
        <div className={styles.navBarInner}>
          <Link to="/" className={styles.navLink}>TRANG CHỦ</Link>
          <div className={styles.navItem}>
            <Link
              to="/menu"
              className={styles.navLink}
              aria-haspopup={dropdownCategories.length > 0 ? 'true' : undefined}
            >
              MENU
            </Link>

            {dropdownCategories.length > 0 && (
              <div className={styles.megaDropdown}>
                {dropdownCategories.map((category) => (
                  <div key={category.id} className={styles.dropdownColumn}>
                    <Link to={getMenuPath(category)} className={styles.dropdownTitle}>
                      {category.name}
                    </Link>
                    <div className={styles.dropdownList}>
                      {category.children.map((child) => (
                        <Link key={child.id} to={getMenuPath(child)} className={styles.dropdownLink}>
                          {toSentenceCase(child.name)}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link to="/menu/packaged" className={styles.navLink}>SẢN PHẨM ĐÓNG GÓI</Link>
          <Link to="/about" className={styles.navLink}>VỀ CHÚNG TÔI</Link>
          <Link to="/promotions" className={styles.navLink}>KHUYẾN MÃI</Link>
          <Link to="/profile" className={styles.navLink}>HỘI VIÊN</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
