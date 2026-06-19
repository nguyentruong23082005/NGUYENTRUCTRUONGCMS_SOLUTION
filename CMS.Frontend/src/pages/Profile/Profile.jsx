import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useCustomers from '../../hooks/useCustomers';

// ── Tab components (mỗi tab là 1 component riêng, tái sử dụng được) ──
import ProfileInfo          from '../../components/customer/ProfileInfo';
import MemberCardTab        from '../../components/customer/MemberCardTab';
import VoucherList          from '../../components/voucher/VoucherList';
import AddressList          from '../../components/customer/AddressList';
import OrderList            from '../../components/order/OrderList';
import FavoriteList         from '../../components/customer/FavoriteList';
import OrderedProductsList  from '../../components/customer/OrderedProductsList';
import HelpCenterTab        from '../../components/customer/HelpCenterTab';

import styles from './Profile.module.css';

import {
  ProfileIcon,
  MemberIcon,
  VoucherIcon,
  AddressIcon,
  OrdersIcon,
  FavoriteIcon,
  OrderedProductsIcon,
  HelpIcon,
  LogoutIcon
} from '../../components/common/Icons';

// ── Tab definitions ────────────────────────────────────────
const TABS = [
  { key: 'profile',          label: 'Thông tin cá nhân',     Icon: ProfileIcon },
  { key: 'member',           label: 'Khách hàng thành viên',  Icon: MemberIcon },
  { key: 'vouchers',         label: 'Ưu đãi của tôi',        Icon: VoucherIcon },
  { key: 'addresses',        label: 'Số địa chỉ',             Icon: AddressIcon },
  { key: 'orders',           label: 'Đơn hàng',               Icon: OrdersIcon },
  { key: 'favorites',        label: 'Sản phẩm yêu thích',    Icon: FavoriteIcon },
  { key: 'ordered-products', label: 'Sản phẩm đã đặt',       Icon: OrderedProductsIcon },
  { key: 'help',             label: 'Trung tâm trợ giúp',     Icon: HelpIcon },
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

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Tài khoản của tôi - Phúc Long Coffee &amp; Tea</title>
      </Helmet>

      <div className={styles.container}>
        {/* ── Breadcrumbs ── */}
        <div className={styles.breadcrumbs}>
          <span onClick={() => navigate('/')} className={styles.breadcrumbLink}>Trang chủ</span>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbActive}>Tài khoản</span>
        </div>

        <div className={styles.layout}>
          {/* ── Sidebar ── */}
          <aside className={styles.sidebar}>
            <nav className={styles.sidebarNav}>
              {TABS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  className={`${styles.sidebarLink} ${activeTab === key ? styles.sidebarLinkActive : ''}`}
                  onClick={() => handleTabChange(key)}
                >
                  <div className={styles.sidebarLinkLeft}>
                    <Icon className={styles.sidebarIcon} />
                    <span>{label}</span>
                  </div>
                  <span className={styles.sidebarChevron}>&gt;</span>
                </button>
              ))}

              <button
                type="button"
                className={`${styles.sidebarLink} ${styles.sidebarLinkDanger}`}
                onClick={handleLogout}
              >
                <div className={styles.sidebarLinkLeft}>
                  <LogoutIcon className={styles.sidebarIcon} />
                  <span>Đăng xuất</span>
                </div>
                <span className={styles.sidebarChevron}>&gt;</span>
              </button>
            </nav>
          </aside>

          {/* ── Content — render component theo tab ── */}
          <main className={styles.content}>
            {activeTab === 'profile' && (
              <ProfileInfo profile={profile} onRefresh={loadProfile} />
            )}
            {activeTab === 'member' && (
              <MemberCardTab profile={profile} />
            )}
            {activeTab === 'vouchers' && <VoucherList />}
            {activeTab === 'addresses' && <AddressList />}
            {activeTab === 'orders' && <OrderList />}
            {activeTab === 'favorites' && <FavoriteList />}
            {activeTab === 'ordered-products' && <OrderedProductsList />}
            {activeTab === 'help' && <HelpCenterTab />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
