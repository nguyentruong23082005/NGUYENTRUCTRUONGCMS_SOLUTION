import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useCustomers from '../../hooks/useCustomers';
import useOrders from '../../hooks/useOrders';
import useVouchers from '../../hooks/useVouchers';
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

// ── Helpers ────────────────────────────────────────────────
const formatCurrency = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

const STATUS_MAP = {
  Pending:    { label: 'Chờ xử lý',    cls: styles.statusPending },
  Processing: { label: 'Đang xử lý',   cls: styles.statusProcessing },
  Shipping:   { label: 'Đang giao',    cls: styles.statusShipping },
  Delivered:  { label: 'Đã giao',      cls: styles.statusDelivered },
  Cancelled:  { label: 'Đã hủy',       cls: styles.statusCancelled },
};

const ADDRESS_EMPTY = {
  receiverName: '', receiverPhone: '', addressLine: '',
  province: '', district: '', ward: '', addressType: 'Home', isDefault: false,
};

// ── Tab: Thông tin cá nhân ─────────────────────────────────
function TabProfile({ profile, onRefresh }) {
  const { updateProfile, loading } = useCustomers();
  const [form, setForm] = useState({
    fullName: profile?.fullName || '',
    phone: profile?.phone || '',
    currentPassword: '',
    newPassword: '',
  });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (profile) {
      setForm((f) => ({ ...f, fullName: profile.fullName || '', phone: profile.phone || '' }));
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!form.fullName.trim()) {
      setMsg({ type: 'error', text: 'Họ và tên không được để trống.' });
      return;
    }
    try {
      await updateProfile({
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || null,
        currentPassword: form.currentPassword || null,
        newPassword: form.newPassword || null,
      });
      setMsg({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '' }));
      onRefresh();
    } catch {
      setMsg({ type: 'error', text: 'Cập nhật thất bại. Vui lòng kiểm tra lại.' });
    }
  };

  return (
    <>
      <h2 className={styles.contentTitle}>Thông tin cá nhân</h2>
      {msg && (
        <div className={msg.type === 'success' ? styles.successMsg : styles.errorMsg}>
          {msg.text}
        </div>
      )}
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Email (không thể thay đổi)</label>
          <input className={styles.formInput} value={profile?.email || ''} disabled />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="fullName">Họ và tên *</label>
          <input
            id="fullName" name="fullName" className={styles.formInput}
            value={form.fullName} onChange={handleChange} maxLength={100}
            placeholder="Nhập họ và tên"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="phone">Số điện thoại</label>
          <input
            id="phone" name="phone" className={styles.formInput}
            value={form.phone} onChange={handleChange}
            placeholder="Nhập số điện thoại"
          />
        </div>

        <p className={styles.formSectionTitle}>Đổi mật khẩu (để trống nếu không đổi)</p>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="currentPassword">Mật khẩu hiện tại</label>
          <input
            id="currentPassword" name="currentPassword" type="password"
            className={styles.formInput} value={form.currentPassword}
            onChange={handleChange} placeholder="Nhập mật khẩu hiện tại"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="newPassword">Mật khẩu mới</label>
          <input
            id="newPassword" name="newPassword" type="password"
            className={styles.formInput} value={form.newPassword}
            onChange={handleChange} placeholder="Tối thiểu 6 ký tự"
          />
          <span className={styles.formHint}>Chỉ điền nếu muốn thay đổi mật khẩu.</span>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Cập nhật'}
          </button>
        </div>
      </form>
    </>
  );
}

// ── Tab: Ưu đãi ────────────────────────────────────────────
function TabVouchers() {
  const { getAvailableVouchers, loading } = useVouchers();
  const [vouchers, setVouchers] = useState([]);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    getAvailableVouchers().then(setVouchers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <h2 className={styles.contentTitle}>Ưu đãi của tôi</h2>
      {loading && <p className={styles.emptyState}>Đang tải ưu đãi...</p>}
      {!loading && vouchers.length === 0 && (
        <div className={styles.emptyState}>
          <p>Hiện chưa có ưu đãi nào.</p>
        </div>
      )}
      <div className={styles.voucherGrid}>
        {vouchers.map((v) => {
          const discountLabel = v.isPercent
            ? `Giảm ${v.discountValue}%`
            : `Giảm ${formatCurrency(v.discountValue)}`;
          return (
            <div key={v.id} className={styles.voucherCard}>
              <div className={styles.voucherCardHeader}>
                <span className={styles.voucherBadge}>Voucher</span>
              </div>
              <div className={styles.voucherDiscount}>{discountLabel}</div>
              <div className={styles.voucherMeta}>
                Đơn tối thiểu: {formatCurrency(v.minimumOrderAmount)}
              </div>
              <div className={styles.voucherCode}>
                <span className={styles.voucherCodeText}>{v.code}</span>
                <button
                  type="button"
                  className={styles.voucherCopyBtn}
                  onClick={() => handleCopy(v.code)}
                >
                  {copied === v.code ? '✓ Đã copy' : 'Copy'}
                </button>
              </div>
              <div className={styles.voucherExpiry}>
                HSD: {formatDate(v.expiryDate)}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Tab: Số địa chỉ ───────────────────────────────────────
function TabAddresses() {
  const { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress, loading } =
    useCustomers();
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(ADDRESS_EMPTY);
  const [msg, setMsg] = useState(null);

  const reload = useCallback(() => {
    getAddresses().then(setAddresses).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const openAddForm = () => {
    setEditId(null);
    setForm(ADDRESS_EMPTY);
    setShowForm(true);
    setMsg(null);
  };

  const openEditForm = (addr) => {
    setEditId(addr.id);
    setForm({
      receiverName: addr.receiverName,
      receiverPhone: addr.receiverPhone,
      addressLine: addr.addressLine,
      province: addr.province,
      district: addr.district,
      ward: addr.ward,
      addressType: addr.addressType,
      isDefault: addr.isDefault,
    });
    setShowForm(true);
    setMsg(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      if (editId) {
        await updateAddress(editId, form);
        setMsg({ type: 'success', text: 'Cập nhật địa chỉ thành công!' });
      } else {
        await createAddress(form);
        setMsg({ type: 'success', text: 'Thêm địa chỉ thành công!' });
      }
      setShowForm(false);
      reload();
    } catch {
      setMsg({ type: 'error', text: 'Không thể lưu địa chỉ. Vui lòng thử lại.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    try {
      await deleteAddress(id);
      reload();
    } catch {
      setMsg({ type: 'error', text: 'Không thể xóa địa chỉ.' });
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      reload();
    } catch {
      setMsg({ type: 'error', text: 'Không thể thiết lập địa chỉ mặc định.' });
    }
  };

  return (
    <>
      <h2 className={styles.contentTitle}>Số địa chỉ</h2>

      {msg && (
        <div className={msg.type === 'success' ? styles.successMsg : styles.errorMsg} style={{ marginBottom: 16 }}>
          {msg.text}
        </div>
      )}

      {showForm && (
        <div className={styles.addressFormCard}>
          <p className={styles.addressFormTitle}>
            {editId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </p>
          <form onSubmit={handleSubmit}>
            <div className={styles.addressFormGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="receiverName">Tên người nhận *</label>
                <input id="receiverName" name="receiverName" className={styles.formInput}
                  value={form.receiverName} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="receiverPhone">Số điện thoại *</label>
                <input id="receiverPhone" name="receiverPhone" className={styles.formInput}
                  value={form.receiverPhone} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="province">Tỉnh/Thành phố *</label>
                <input id="province" name="province" className={styles.formInput}
                  value={form.province} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="district">Quận/Huyện *</label>
                <input id="district" name="district" className={styles.formInput}
                  value={form.district} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="ward">Phường/Xã *</label>
                <input id="ward" name="ward" className={styles.formInput}
                  value={form.ward} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="addressType">Loại địa chỉ *</label>
                <select id="addressType" name="addressType" className={styles.formInput}
                  value={form.addressType} onChange={handleChange}>
                  <option value="Home">Nhà riêng</option>
                  <option value="Office">Văn phòng</option>
                  <option value="Other">Khác</option>
                </select>
              </div>
              <div className={`${styles.formGroup} ${styles.addressFormFull}`}>
                <label className={styles.formLabel} htmlFor="addressLine">Địa chỉ chi tiết *</label>
                <input id="addressLine" name="addressLine" className={styles.formInput}
                  value={form.addressLine} onChange={handleChange} required
                  placeholder="Số nhà, tên đường..." />
              </div>
              <div className={`${styles.formGroup} ${styles.addressFormFull}`}>
                <label className={styles.checkboxGroup}>
                  <input type="checkbox" name="isDefault"
                    checked={form.isDefault} onChange={handleChange} />
                  Đặt làm địa chỉ mặc định
                </label>
              </div>
            </div>
            <div className={styles.formActions} style={{ marginTop: 16 }}>
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu địa chỉ'}
              </button>
              <button type="button" className={styles.btnSecondary}
                onClick={() => { setShowForm(false); setMsg(null); }}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.addressList}>
        {addresses.length === 0 && !loading && (
          <div className={styles.emptyState}><p>Bạn chưa có địa chỉ nào.</p></div>
        )}
        {addresses.map((addr) => {
          const typeLabel = addr.addressType === 'Home' ? 'Nhà riêng'
            : addr.addressType === 'Office' ? 'Văn phòng' : addr.addressType;
          return (
            <div key={addr.id}
              className={`${styles.addressCard} ${addr.isDefault ? styles.addressCardDefault : ''}`}>
              <div className={styles.addressInfo}>
                <div className={styles.addressName}>
                  {addr.receiverName} — {addr.receiverPhone}
                </div>
                <div className={styles.addressDetail}>
                  {addr.addressLine}, {addr.ward}, {addr.district}, {addr.province}
                </div>
                <div className={styles.addressTags}>
                  <span className={styles.addressTag}>{typeLabel}</span>
                  {addr.isDefault && (
                    <span className={`${styles.addressTag} ${styles.addressTagDefault}`}>
                      Mặc định
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.addressActions}>
                <button type="button" className={styles.btnIconAction}
                  onClick={() => openEditForm(addr)}>
                  Chỉnh sửa
                </button>
                {!addr.isDefault && (
                  <button type="button" className={styles.btnIconAction}
                    onClick={() => handleSetDefault(addr.id)}>
                    Đặt mặc định
                  </button>
                )}
                <button type="button"
                  className={`${styles.btnIconAction} ${styles.btnIconDanger}`}
                  onClick={() => handleDelete(addr.id)}>
                  Xóa
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!showForm && (
        <div className={styles.addBtn}>
          <button type="button" className={styles.btnPrimary} onClick={openAddForm}>
            + Thêm địa chỉ mới
          </button>
        </div>
      )}
    </>
  );
}

// ── Tab: Đơn hàng ──────────────────────────────────────────
function TabOrders() {
  const { getOrderHistory, cancelOrder, loading } = useOrders();
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [msg, setMsg] = useState(null);

  const reload = useCallback(() => {
    getOrderHistory({ page: 1, pageSize: 20 }).then(setOrders);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    setMsg(null);
    try {
      await cancelOrder(id);
      setMsg({ type: 'success', text: 'Hủy đơn hàng thành công!' });
      reload();
    } catch {
      setMsg({ type: 'error', text: 'Không thể hủy đơn hàng. Vui lòng thử lại.' });
    }
  };

  return (
    <>
      <h2 className={styles.contentTitle}>Lịch sử đơn hàng</h2>

      {msg && (
        <div className={msg.type === 'success' ? styles.successMsg : styles.errorMsg}
          style={{ marginBottom: 16 }}>
          {msg.text}
        </div>
      )}

      {loading && <p className={styles.emptyState}>Đang tải đơn hàng...</p>}
      {!loading && orders.length === 0 && (
        <div className={styles.emptyState}><p>Bạn chưa có đơn hàng nào.</p></div>
      )}

      <div className={styles.orderList}>
        {orders.map((order) => {
          const status = STATUS_MAP[order.status] || { label: order.status, cls: '' };
          const isExpanded = expandedId === order.id;
          return (
            <div key={order.id} className={styles.orderCard}>
              <div
                className={styles.orderCardHeader}
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                role="button"
                aria-expanded={isExpanded}
              >
                <div className={styles.orderMeta}>
                  <span className={styles.orderId}>#{order.id}</span>
                  <span className={styles.orderDate}>{formatDate(order.orderDate)}</span>
                </div>
                <div className={styles.orderCardRight}>
                  <span className={`${styles.orderStatusBadge} ${status.cls}`}>
                    {status.label}
                  </span>
                  <span className={styles.orderTotal}>{formatCurrency(order.totalAmount)}</span>
                  <span style={{ color: '#9B9B9B', fontSize: 13 }}>{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {isExpanded && (
                <div className={styles.orderCardBody}>
                  <div className={styles.orderProductList}>
                    {(order.items || []).map((item) => (
                      <div key={item.id} className={styles.orderProduct}>
                        <div className={styles.orderProductName}>
                          {item.productName} × {item.quantity}
                          {item.options && item.options.length > 0 && (
                            <div className={styles.orderProductOptions}>
                              {item.options.map((o) => o.name).join(', ')}
                            </div>
                          )}
                        </div>
                        <span className={styles.orderProductPrice}>
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.orderFooter}>
                    <div className={styles.orderSummary}>
                      Giao tới: {order.shippingAddress || '—'}
                      {order.discountAmount > 0 && (
                        <div>Giảm giá: -{formatCurrency(order.discountAmount)}</div>
                      )}
                      <div className={styles.orderSummaryTotal}>
                        Tổng cộng: {formatCurrency(order.totalAmount)}
                      </div>
                    </div>

                    {order.status === 'Pending' && (
                      <button type="button" className={styles.btnCancel}
                        onClick={() => handleCancel(order.id)} disabled={loading}>
                        Hủy đơn
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Main Profile Component ─────────────────────────────────
const TABS = [
  { key: 'profile',   label: 'Thông tin cá nhân', Icon: IconProfile },
  { key: 'vouchers',  label: 'Ưu đãi của tôi',    Icon: IconVoucher },
  { key: 'addresses', label: 'Số địa chỉ',         Icon: IconAddress },
  { key: 'orders',    label: 'Đơn hàng',           Icon: IconOrders },
];

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

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayUser = profile || user;
  const displayName = displayUser?.fullName || displayUser?.userName || 'Khách hàng';
  const displayEmail = displayUser?.email || '';

  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <Helmet><title>Đăng nhập - Phúc Long Coffee &amp; Tea</title></Helmet>
        <div className={styles.container}>
          <div className={styles.unauthCard}>
            <h2>Vui lòng đăng nhập</h2>
            <p>Bạn cần đăng nhập để xem thông tin cá nhân và quản lý đơn hàng.</p>
            <button type="button" className={styles.loginBtn} onClick={() => navigate('/login')}>
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

          {/* ── Content ── */}
          <main className={styles.content}>
            {activeTab === 'profile' && (
              <TabProfile profile={profile} onRefresh={loadProfile} />
            )}
            {activeTab === 'vouchers' && <TabVouchers />}
            {activeTab === 'addresses' && <TabAddresses />}
            {activeTab === 'orders' && <TabOrders />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
