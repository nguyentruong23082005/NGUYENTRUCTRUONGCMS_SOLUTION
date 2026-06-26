import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useDelivery } from '../../../context/DeliveryContext';
import categoryApi from '../../../api/categoryApi';
import productService from '../../../services/productService';
import logoImg from '../../../assets/images/logo.png';
import deliveryImg from '../../../assets/images/delivery-686d7142750173aa8bc5f1d11ea195e4.png';
import DeliveryModal from '../../common/DeliveryModal';
import styles from './Header.module.css';

const getFullImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5188';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

const normalizeCategory = (item) => ({
  id: String(item.id),
  name: item.name,
  slug: item.slug || '',
  imageUrl: item.imageUrl ? getFullImageUrl(item.imageUrl) : '',
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
  const { deliveryType, deliveryAddress, selectedStore, openModal } = useDelivery();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
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

  useEffect(() => {
    const keyword = searchQuery.trim();
    if (keyword.length < 2) {
      setSearchSuggestions([]);
      setIsSearchOpen(false);
      setIsSearching(false);
      return undefined;
    }

    let cancelled = false;
    setIsSearching(true);

    const timer = window.setTimeout(async () => {
      try {
        const results = await productService.searchProducts({
          q: keyword,
          page: 1,
          pageSize: 5,
          sortBy: 'CreatedAt',
          sortOrder: 'desc'
        });

        if (!cancelled) {
          setSearchSuggestions(results);
          setIsSearchOpen(true);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Khong tai duoc goi y tim kiem tu API:', error);
          setSearchSuggestions([]);
          setIsSearchOpen(true);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  const dropdownCategories = useMemo(
    () => menuCategories.filter((category) => category.children.length > 0),
    [menuCategories]
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const keyword = searchQuery.trim();
    if (keyword) {
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(keyword)}`);
    }
  };

  const handleSuggestionSelect = (product) => {
    setSearchQuery(product.name);
    setIsSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(product.name)}`);
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
              onFocus={() => {
                if (searchQuery.trim().length >= 2) {
                  setIsSearchOpen(true);
                }
              }}
              onBlur={() => window.setTimeout(() => setIsSearchOpen(false), 120)}
              className={styles.searchInput}
              aria-label="Tìm kiếm sản phẩm"
              aria-expanded={isSearchOpen}
            />
            {isSearchOpen && searchQuery.trim().length >= 2 && (
              <div className={styles.searchDropdown} role="listbox" aria-label="Gợi ý tìm kiếm">
                {isSearching ? (
                  <div className={styles.searchState}>Đang tìm...</div>
                ) : searchSuggestions.length > 0 ? (
                  searchSuggestions.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      className={styles.searchSuggestion}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        handleSuggestionSelect(product);
                      }}
                    >
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" className={styles.searchSuggestionImage} />
                      ) : (
                        <span className={styles.searchSuggestionPlaceholder} aria-hidden="true" />
                      )}
                      <span className={styles.searchSuggestionText}>
                        <strong>{product.name}</strong>
                        <small>{product.productCategoryName || 'Sản phẩm'}</small>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className={styles.searchState}>Không tìm thấy sản phẩm phù hợp</div>
                )}
              </div>
            )}
          </form>

          <div className={styles.headerSpacer} />

          <button type="button" className={styles.deliveryButton} onClick={openModal}>
            <img src={deliveryImg} alt="" className={styles.deliveryIcon} aria-hidden="true" />
            <span className={styles.deliveryTextGroup}>
              <strong>{deliveryType === 'delivery' ? 'Giao Hàng' : 'Đến Lấy'}</strong>
              <small>
                {deliveryType === 'delivery' 
                  ? (deliveryAddress || 'Chọn địa chỉ giao hàng...') 
                  : (selectedStore ? selectedStore.name : 'Chọn cửa hàng...')}
              </small>
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
                      {category.imageUrl && (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className={styles.dropdownCategoryIcon}
                        />
                      )}
                      <span>{category.name}</span>
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
      <DeliveryModal />
    </header>
  );
};

export default Header;
