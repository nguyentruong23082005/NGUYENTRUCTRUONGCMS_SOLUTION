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

import {
  ProfileIcon,
  VoucherIcon,
  AddressIcon,
  OrdersIcon,
  LogoutIcon
} from '../../components/common/Icons';

// ── Tab definitions ────────────────────────────────────────
const TABS = [
  { key: 'profile',   label: 'Thông tin cá nhân', Icon: ProfileIcon },
  { key: 'vouchers',  label: 'Ưu đãi của tôi',    Icon: VoucherIcon },
  { key: 'addresses', label: 'Số địa chỉ',         Icon: AddressIcon },
  { key: 'orders',    label: 'Đơn hàng',           Icon: OrdersIcon },
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
                  <Icon className={styles.sidebarIcon} />
                  {label}
                </button>
              ))}

              <div className={styles.sidebarDivider} />

              <button
                type="button"
                className={`${styles.sidebarLink} ${styles.sidebarLinkDanger}`}
                onClick={handleLogout}
              >
                <LogoutIcon className={styles.sidebarIcon} />
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
