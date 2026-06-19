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

import {
  HeaderAccountIcon,
  HeaderMailIcon,
  SearchIcon,
  ProfileIcon,
  RegisterIcon,
  LogoutIcon,
  VoucherIcon,
  AddressIcon,
  OrdersIcon
} from '../../common/Icons';

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
            <span className={styles.searchIcon} aria-hidden="true">
              <SearchIcon />
            </span>
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
              <HeaderMailIcon className={styles.headerSvgIcon} />
            </Link>

            <div className={styles.accountMenu}>
              <Link
                to={isAuthenticated ? '/customer/account' : '/login'}
                className={styles.iconButton}
                aria-label={isAuthenticated ? (user.fullName || user.userName || 'Tài khoản') : 'Đăng nhập'}
                aria-haspopup="true"
              >
                <HeaderAccountIcon className={styles.headerSvgIcon} />
              </Link>

              <div className={styles.accountDropdown}>
                {isAuthenticated ? (
                  <>
                    <Link to="/customer/account?tab=profile" className={styles.accountDropdownItem}>
                      <ProfileIcon className={styles.accountMenuSvg} />
                      <span>Thông tin cá nhân</span>
                    </Link>
                    <Link to="/customer/account?tab=vouchers" className={styles.accountDropdownItem}>
                      <VoucherIcon className={styles.accountMenuSvg} />
                      <span>Ưu đãi của tôi</span>
                    </Link>
                    <Link to="/customer/account?tab=addresses" className={styles.accountDropdownItem}>
                      <AddressIcon className={styles.accountMenuSvg} />
                      <span>Số địa chỉ</span>
                    </Link>
                    <Link to="/customer/account?tab=orders" className={styles.accountDropdownItem}>
                      <OrdersIcon className={styles.accountMenuSvg} />
                      <span>Đơn hàng</span>
                    </Link>
                    <button type="button" onClick={handleLogout} className={styles.accountDropdownItem}>
                      <LogoutIcon className={styles.accountMenuSvg} />
                      <span>Đăng xuất</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className={`${styles.accountDropdownItem} ${styles.accountDropdownItemActive}`}>
                      <ProfileIcon className={styles.accountMenuSvg} />
                      <span>Đăng nhập</span>
                    </Link>
                    <Link to="/register" className={styles.accountDropdownItem}>
                      <RegisterIcon className={styles.accountMenuSvg} />
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
