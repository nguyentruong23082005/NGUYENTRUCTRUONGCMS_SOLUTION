import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useCustomers from '../../hooks/useCustomers';

// ── Tab components (mỗi tab là 1 component riêng, tái sử dụng được) ──
import ProfileInfo from '../../components/customer/ProfileInfo';
import AddressList  from '../../components/customer/AddressList';
import VoucherList  from '../../components/voucher/VoucherList';
import OrderList    from '../../components/order/OrderList';

import styles from './Profile.module.css';

// ── Sidebar icons ──────────────────────────────────────────
const IconProfile = () => (
  <svg viewBox="0 0 24 24" className={styles.sidebarIcon} aria-hidden="true">
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 19c.8-3.5 3.3-5.5 7-5.5s6.2 2 7 5.5" />
  </svg>
);
const IconVoucher = () => (
  <svg viewBox="0 0 24 24" className={styles.sidebarIcon} aria-hidden="true">
    <rect x="2" y="7" width="20" height="10" rx="2" />
    <line x1="16" y1="7" x2="16" y2="17" strokeDasharray="2 2" />
    <circle cx="16" cy="12" r="1.5" />
  </svg>
);
const IconAddress = () => (
  <svg viewBox="0 0 24 24" className={styles.sidebarIcon} aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);
const IconOrders = () => (
  <svg viewBox="0 0 24 24" className={styles.sidebarIcon} aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" className={styles.sidebarIcon} aria-hidden="true">
    <path d="M10 6H6.5A1.5 1.5 0 005 7.5v9A1.5 1.5 0 006.5 18H10" />
    <path d="M14 8l4 4-4 4" />
    <path d="M18 12H9" />
  </svg>
);

// ── Tab definitions ────────────────────────────────────────
const TABS = [
  { key: 'profile',   label: 'Thông tin cá nhân', Icon: IconProfile },
  { key: 'vouchers',  label: 'Ưu đãi của tôi',    Icon: IconVoucher },
  { key: 'addresses', label: 'Số địa chỉ',         Icon: IconAddress },
  { key: 'orders',    label: 'Đơn hàng',           Icon: IconOrders },
];

// ── Main Profile Page (layout shell + sidebar + tab routing) ──
const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getProfile } = useCustomers();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);

  const activeTab = searchParams.get('tab') || 'profile';

  const loadProfile = useCallback(() => {
    if (isAuthenticated) {
      getProfile().then(setProfile).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ── Unauthenticated state ──────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <Helmet>
          <title>Đăng nhập - Phúc Long Coffee &amp; Tea</title>
        </Helmet>
        <div className={styles.container}>
          <div className={styles.unauthCard}>
            <h2>Vui lòng đăng nhập</h2>
            <p>Bạn cần đăng nhập để xem thông tin cá nhân và quản lý đơn hàng.</p>
            <button
              type="button"
              className={styles.loginBtn}
              onClick={() => navigate('/login')}
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayUser = profile || user;
  const displayName = displayUser?.fullName || displayUser?.userName || 'Khách hàng';
  const displayEmail = displayUser?.email || '';

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Tài khoản của tôi - Phúc Long Coffee &amp; Tea</title>
      </Helmet>

      <div className={styles.container}>
        <div className={styles.layout}>

          {/* ── Sidebar ── */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarUser}>
              <div className={styles.sidebarAvatar}>👤</div>
              <div className={styles.sidebarName}>{displayName}</div>
              {displayEmail && (
                <div className={styles.sidebarEmail}>{displayEmail}</div>
              )}
            </div>

            <nav className={styles.sidebarNav}>
              {TABS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  className={`${styles.sidebarLink} ${activeTab === key ? styles.sidebarLinkActive : ''}`}
                  onClick={() => handleTabChange(key)}
                >
                  <Icon />
                  {label}
                </button>
              ))}

              <div className={styles.sidebarDivider} />

              <button
                type="button"
                className={`${styles.sidebarLink} ${styles.sidebarLinkDanger}`}
                onClick={handleLogout}
              >
                <IconLogout />
                Đăng xuất
              </button>
            </nav>
          </aside>

          {/* ── Content — render component theo tab ── */}
          <main className={styles.content}>
            {activeTab === 'profile' && (
              <ProfileInfo profile={profile} onRefresh={loadProfile} />
            )}
            {activeTab === 'vouchers' && <VoucherList />}
            {activeTab === 'addresses' && <AddressList />}
            {activeTab === 'orders' && <OrderList />}
          </main>

        </div>
      </div>
    </div>
  );
};

export default Profile;
