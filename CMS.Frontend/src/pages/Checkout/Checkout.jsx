import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';
import useCustomers from '../../hooks/useCustomers';
import { getFullImageUrl } from '../../utils/imageHelper';
import orderApi from '../../api/orderApi';
import styles from './Checkout.module.css';

const Checkout = () => {
  const { cartItems, cartTotalPrice, clearCart, updateCartQuantity, removeFromCart, showToast } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { deliveryType, deliveryAddress, structuredAddress, openModal, setDelivery } = useDelivery();
  const { getProfile, getAddresses } = useCustomers();
  const navigate = useNavigate();

  // Thông tin người nhận — lấy từ API hồ sơ thật
  const [fullName, setFullName] = useState('');
  const [phone, setPhone]       = useState('');

  // Các state cho sổ địa chỉ và form sửa thông tin
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [showReceiverForm, setShowReceiverForm] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      getProfile()
        .then(profile => {
          if (profile) {
            setFullName(profile.fullName || user?.fullName || '');
            setPhone(profile.phone || user?.phoneNumber || '');
          }
        })
        .catch(console.error);

      getAddresses()
        .then(addresses => {
          if (addresses && Array.isArray(addresses)) {
            setSavedAddresses(addresses);
          }
        })
        .catch(console.error);
    } else if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phoneNumber || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // Ghi chú, mã voucher, phương thức thanh toán, điều khoản
  const [notes,         setNotes]         = useState('');
  const [voucherCode,   setVoucherCode]   = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Tab: delivery | pickup — đồng bộ với DeliveryContext
  const [activeTab, setActiveTab] = useState(deliveryType === 'pickup' ? 'pickup' : 'delivery');
  useEffect(() => {
    setActiveTab(deliveryType === 'pickup' ? 'pickup' : 'delivery');
  }, [deliveryType]);

  // Expand/collapse ghi chú
  const [notesExpanded, setNotesExpanded] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess,    setIsSuccess]    = useState(false);

  const formatPrice = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  // ─── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) { showToast('Vui lòng nhập họ tên người nhận!', 'error'); return; }
    if (!phone.trim() || !/^[0-9]{10,11}$/.test(phone.trim())) {
      showToast('Số điện thoại không hợp lệ (10-11 chữ số)!', 'error'); return;
    }
    if (!agreedToTerms) { showToast('Vui lòng đồng ý với điều khoản!', 'error'); return; }

    setIsSubmitting(true);

    const shippingAddress = deliveryAddress ||
      [structuredAddress?.street, structuredAddress?.ward, structuredAddress?.district, structuredAddress?.province]
        .filter(Boolean).join(', ');

    const payload = {
      customerAddressId: null,
      receiverName:  fullName,
      receiverPhone: phone,
      shippingAddress,
      notes,
      voucherCode: voucherCode.trim() || null,
      items: cartItems.map(item => ({
        productId:    Number(item.id),
        quantity:     item.quantity,
        optionValueIds: item.optionValueIds || [],
      })),
    };

    try {
      await orderApi.create(payload);
      setIsSuccess(true);
      clearCart();
      showToast('Đặt hàng thành công! Phúc Long sẽ liên hệ sớm nhất.');
      setTimeout(() => navigate('/'), 4000);
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra. Vui lòng thử lại!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Giỏ trống ─────────────────────────────────────────────
  if (cartItems.length === 0 && !isSuccess) {
    return (
      <div className={styles.page}>
        <Helmet><title>Thanh toán - Giỏ hàng trống</title></Helmet>
        <div className="container">
          <div className={styles.emptyContainer}>
            <span className={styles.emptyIcon}>🛒</span>
            <h3>Giỏ hàng của bạn đang trống</h3>
            <p>Vui lòng thêm sản phẩm trước khi tiến hành thanh toán.</p>
            <Link to="/menu" className={styles.backBtn}>Quay lại chọn món</Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Thành công ────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className={styles.successPage}>
        <Helmet><title>Đặt hàng thành công - Cảm ơn quý khách</title></Helmet>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>🎉</div>
          <h2>Đặt Hàng Thành Công!</h2>
          <p className={styles.successText}>
            Cảm ơn <strong>{fullName}</strong> đã tin dùng Phúc Long Heritage.
            Chúng tôi sẽ liên hệ qua <strong>{phone}</strong> trong giây lát.
          </p>
          <p className={styles.redirectText}>Tự động điều hướng về Trang chủ sau ít giây...</p>
          <Link to="/" className={styles.homeBtn}>Quay lại Trang chủ</Link>
        </div>
      </div>
    );
  }

  const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0);

  // ─── Main ──────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <Helmet><title>Thanh toán đơn hàng - Phúc Long Coffee &amp; Tea</title></Helmet>

      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/" className={styles.breadcrumbLink}>Trang chủ</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbActive}>Thanh toán</span>
        </nav>

        <div className={styles.layout}>

          {/* ══ CỘT TRÁI ══════════════════════════════════════ */}
          <form onSubmit={handleSubmit} id="checkout-form" noValidate className={styles.leftCol}>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'delivery' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('delivery')}
              >GIAO HÀNG</button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'pickup' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('pickup')}
              >ĐẾN LẤY</button>
            </div>

            {/* ── Địa chỉ ── */}
            <button 
              type="button" 
              className={styles.row} 
              onClick={() => {
                if (isAuthenticated && savedAddresses.length > 0) {
                  setShowAddressPicker(!showAddressPicker);
                } else {
                  openModal();
                }
              }}
            >
              <div className={styles.rowBody}>
                <div className={styles.rowLabelWrapper}>
                  <svg className={styles.mapPinIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span className={styles.rowLabel}>Địa chỉ</span>
                </div>
                <span className={styles.rowValue}>
                  {deliveryAddress || 'Chưa chọn địa chỉ giao hàng'}
                </span>
              </div>
              <svg className={styles.chevronSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            {showAddressPicker && (
              <div className={styles.addressPickerPanel}>
                <div className={styles.addressList}>
                  {savedAddresses.map((addr) => {
                    const fullAddr = [addr.addressLine, addr.ward, addr.district, addr.province].filter(Boolean).join(', ');
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        className={`${styles.addressCard} ${deliveryAddress === fullAddr ? styles.addressCardActive : ''}`}
                        onClick={() => {
                          setDelivery(fullAddr, null, {
                            street: addr.addressLine || '',
                            ward: addr.ward || '',
                            district: addr.district || '',
                            province: addr.province || ''
                          }, null);
                          setFullName(addr.receiverName || '');
                          setPhone(addr.receiverPhone || '');
                          setShowAddressPicker(false);
                        }}
                      >
                        <div className={styles.addressHeader}>
                          <span className={styles.addressName}>{addr.receiverName} - {addr.receiverPhone}</span>
                          {addr.isDefault && <span className={styles.defaultBadge}>Mặc định</span>}
                        </div>
                        <span className={styles.addressText}>{fullAddr}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className={styles.gpsAlternativeBtn}
                  onClick={() => {
                    setShowAddressPicker(false);
                    openModal();
                  }}
                >
                  Dùng vị trí khác / Tìm địa chỉ mới
                </button>
              </div>
            )}

            {/* ── Người nhận ── */}
            <button type="button" className={styles.row} onClick={() => setShowReceiverForm(!showReceiverForm)}>
              <div className={styles.rowBody}>
                <span className={styles.rowLabel} style={{ color: '#006F3C', fontWeight: 400, textTransform: 'uppercase' }}>
                  {fullName || 'HỌ TÊN NGƯỜI NHẬN'}
                </span>
                <span className={styles.rowValue} style={{ color: '#4a4a4a' }}>
                  Số điện thoại: {phone || 'Chưa nhập'}
                </span>
              </div>
              <svg className={styles.chevronSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            {showReceiverForm && (
              <div className={styles.receiverFormPanel}>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={styles.flatInput}
                  placeholder="Họ và tên người nhận"
                  autoFocus
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={styles.flatInput}
                  placeholder="Nhập số điện thoại"
                />
              </div>
            )}

            {/* ── Ghi chú ── */}
            <button
              type="button"
              className={styles.row}
              onClick={() => setNotesExpanded(v => !v)}
            >
              <div className={styles.rowBody}>
                <span className={styles.rowLabel}>Ghi chú cho cửa hàng</span>
                <span className={styles.rowValue} style={{ color: notes ? '#333' : '#4a4a4a' }}>
                  Ghi chú: {notes || ''}
                </span>
              </div>
              <svg className={styles.chevronSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {notesExpanded && (
              <div className={styles.notesPanel}>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={styles.notesInput}
                  placeholder="Ví dụ: ít đá, ngọt vừa, giao giờ hành chính..."
                  rows={3}
                  autoFocus
                />
              </div>
            )}

            {/* ── VAT ── */}
            <div className={styles.vatSection}>
              <p className={styles.vatTitle}>Thông tin xuất hóa đơn VAT</p>
              <p>- Vui lòng xem hướng dẫn xuất phiếu GTGT (VAT) từ hóa đơn giấy đi kèm món nước.</p>
              <p>- Trường hợp không nhận được hóa đơn giấy, vui lòng liên hệ Hotline CSKH: 1900234518 (nhấn phím 1) hoặc Fanpage Phúc Long Coffee &amp; Tea từ 8h00 - 17h45 để được hỗ trợ nhé.</p>
            </div>
          </form>

          {/* ══ CỘT PHẢI ══════════════════════════════════════ */}
          <aside className={styles.rightCol}>

            {/* ── Giỏ hàng ── */}
            <div className={styles.cartBox}>
              <p className={styles.cartBoxTitle}>Giỏ hàng của bạn ({totalQty} món)</p>

              {cartItems.map((item) => {
                const key      = item.cartKey || item.id;
                const maxStock = item.stockQuantity ?? 99;
                const imgSrc   = getFullImageUrl(item.imageUrl || item.image);

                return (
                  <div key={key} className={styles.cartItem}>
                    {/* Ảnh */}
                    <div className={styles.cartImg}>
                      <img src={imgSrc} alt={item.name} onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>

                    {/* Thông tin + nút xóa */}
                    <div className={styles.cartMeta}>
                      <div className={styles.cartTop}>
                        <span className={styles.cartName}>{item.name}</span>
                        <div className={styles.cartActions}>
                          <button
                            type="button"
                            className={styles.cartEditBtn}
                            onClick={() => navigate(`/product/${item.id}`)}
                            aria-label="Chỉnh sửa"
                            title="Chỉnh sửa"
                          >✏</button>
                          <button
                            type="button"
                            className={styles.cartDeleteBtn}
                            onClick={() => removeFromCart(key)}
                            aria-label="Xóa"
                            title="Xóa"
                          >🗑</button>
                        </div>
                      </div>

                      {item.selectedOptions?.length > 0 && (
                        <span className={styles.cartOpts}>
                          {item.selectedOptions.map(o => o.name).join(', ')}
                        </span>
                      )}

                      <div className={styles.cartBottom}>
                        <span className={styles.cartPrice}>{formatPrice(item.price)}</span>
                        {/* Nút −/+ */}
                        <div className={styles.qtyWrap}>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() => updateCartQuantity(key, item.quantity - 1)}
                          >−</button>
                          <span className={styles.qtyNum}>{item.quantity}</span>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() => updateCartQuantity(key, item.quantity + 1)}
                            disabled={item.quantity >= maxStock}
                          >+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Thông tin thanh toán ── */}
            <div className={styles.summaryBox}>
              <p className={styles.summaryTitle}>Thông tin thanh toán</p>

              <div className={styles.summaryRow}>
                <span>Tổng tiền tạm tính</span>
                <span>{formatPrice(cartTotalPrice)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Phí vận chuyển</span>
                <span>0 đ</span>
              </div>

              {/* Mã giảm giá */}
              <div className={styles.voucherRow}>
                <span>Mã giảm giá</span>
                <div className={styles.voucherCtrl}>
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => { setVoucherCode(e.target.value); setVoucherApplied(false); }}
                    placeholder="Nhập mã voucher..."
                    className={styles.voucherField}
                    maxLength={50}
                  />
                  <button
                    type="button"
                    className={styles.voucherBtn}
                    onClick={() => { if (voucherCode.trim()) setVoucherApplied(true); }}
                  >Áp dụng</button>
                </div>
                {voucherApplied && (
                  <span className={styles.voucherOk}>✓ Đã áp dụng mã "{voucherCode}"</span>
                )}
              </div>

              <div className={`${styles.summaryRow} ${styles.summaryTotalRow}`}>
                <span>Tổng tiền (Đã có VAT)</span>
                <span className={styles.totalAmt}>{formatPrice(cartTotalPrice)}</span>
              </div>
            </div>

            {/* ── Phương thức thanh toán ── */}
            <div className={styles.paymentBox}>
              <p className={styles.summaryTitle}>Phương thức thanh toán</p>
              {[
                { value: 'card', label: 'Thẻ ngân hàng/Thẻ tín dụng/Ví điện tử' },
                { value: 'momo',    label: 'Ví MoMo'      },
                { value: 'zalopay', label: 'Ví ZaloPay'   },
                { value: 'shopee',  label: 'Ví ShopeePay' },
                { value: 'cod',     label: 'Thanh toán tiền mặt khi nhận hàng' },
              ].map(({ value, label }) => (
                <label key={value} className={styles.radioRow}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                    className={styles.radio}
                  />
                  {label}
                </label>
              ))}
            </div>

            {/* ── Điều khoản + nút ── */}
            <div className={styles.termsBox}>
              <label className={styles.termsRow}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>
                  Tôi đã đọc, hiểu và đồng ý với tất cả các{' '}
                  <a href="/about" className={styles.termsLink} target="_blank" rel="noreferrer">
                    điều khoản, điều kiện và chính sách
                  </a>{' '}
                  liên quan
                </span>
              </label>

              <button
                type="submit"
                form="checkout-form"
                className={styles.submitBtn}
                disabled={isSubmitting || !agreedToTerms}
              >
                {isSubmitting ? 'ĐANG XỬ LÝ...' : 'TIẾN HÀNH THANH TOÁN'}
              </button>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
