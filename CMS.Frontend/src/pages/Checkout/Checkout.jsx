import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';
import { getFullImageUrl } from '../../utils/imageHelper';
import orderApi from '../../api/orderApi';
import useCustomers from '../../hooks/useCustomers';
import styles from './Checkout.module.css';

const Checkout = () => {
  const { cartItems, cartTotalPrice, clearCart, updateCartQuantity, removeFromCart, showToast } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { deliveryType, deliveryAddress, structuredAddress, openModal } = useDelivery();
  const navigate = useNavigate();

  // Thông tin người nhận
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');

  // Ghi chú đơn hàng
  const [notes, setNotes] = useState('');

  // Voucher
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);

  // Phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Đồng ý điều khoản
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Tab giao hàng / đến lấy (hiển thị theo DeliveryContext)
  const [activeTab, setActiveTab] = useState(deliveryType === 'pickup' ? 'pickup' : 'delivery');

  // Trạng thái form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Cập nhật tab khi deliveryType thay đổi
  useEffect(() => {
    setActiveTab(deliveryType === 'pickup' ? 'pickup' : 'delivery');
  }, [deliveryType]);

  // Định dạng tiền
  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // Xử lý đặt hàng
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast('Vui lòng nhập tên người nhận!', 'error');
      return;
    }
    if (!phone.trim() || !/^[0-9]{10,11}$/.test(phone.trim())) {
      showToast('Số điện thoại không hợp lệ (10-11 chữ số)!', 'error');
      return;
    }
    if (!agreedToTerms) {
      showToast('Vui lòng đồng ý với điều khoản và chính sách!', 'error');
      return;
    }
    if (cartItems.length === 0) {
      showToast('Giỏ hàng trống!', 'error');
      return;
    }

    setIsSubmitting(true);

    // Ghép địa chỉ đầy đủ
    const shippingAddress = deliveryAddress ||
      [structuredAddress?.street, structuredAddress?.ward, structuredAddress?.district, structuredAddress?.province]
        .filter(Boolean).join(', ');

    const orderPayload = {
      customerAddressId: null,
      receiverName: fullName,
      receiverPhone: phone,
      shippingAddress,
      notes,
      voucherCode: voucherCode.trim() || null,
      items: cartItems.map(item => ({
        productId: Number(item.id),
        quantity: item.quantity,
        optionValueIds: item.optionValueIds || [],
      })),
    };

    try {
      await orderApi.create(orderPayload);
      setIsSuccess(true);
      clearCart();
      showToast('Đặt hàng thành công! Phúc Long sẽ liên hệ giao hàng sớm nhất.');
      setTimeout(() => navigate('/'), 4000);
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      showToast('Có lỗi xảy ra. Vui lòng thử lại!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Empty cart ───────────────────────────────────────────
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

  // ─── Success ──────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className={styles.successPage}>
        <Helmet><title>Đặt hàng thành công - Cảm ơn quý khách</title></Helmet>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>🎉</div>
          <h2>Đặt Hàng Thành Công!</h2>
          <p className={styles.successText}>
            Cảm ơn quý khách <strong>{fullName}</strong> đã tin dùng Phúc Long Heritage.
            Chúng tôi sẽ liên hệ xác nhận qua <strong>{phone}</strong> trong giây lát.
          </p>
          <p className={styles.redirectText}>Tự động điều hướng về Trang chủ sau ít giây...</p>
          <Link to="/" className={styles.homeBtn}>Quay lại Trang chủ</Link>
        </div>
      </div>
    );
  }

  // ─── Main checkout ────────────────────────────────────────
  return (
    <div className={styles.page}>
      <Helmet><title>Thanh toán đơn hàng - Phúc Long Coffee &amp; Tea</title></Helmet>

      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="breadcrumb">
          <Link to="/" className={styles.breadcrumbLink}>Trang chủ</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Thanh toán</span>
        </nav>

        <div className={styles.layout}>
          {/* ══ CỘT TRÁI: Thông tin giao hàng ══ */}
          <form onSubmit={handleCheckoutSubmit} className={styles.leftCol} id="checkout-form" noValidate>

            {/* Tabs GIAO HÀNG / ĐẾN LẤY */}
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'delivery' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('delivery')}
              >
                GIAO HÀNG
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'pickup' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('pickup')}
              >
                ĐẾN LẤY
              </button>
            </div>

            {/* Section: Địa chỉ */}
            <button
              type="button"
              className={styles.sectionRow}
              onClick={openModal}
              aria-label="Thay đổi địa chỉ giao hàng"
            >
              <div className={styles.sectionRowLeft}>
                <span className={styles.sectionIcon}>📍</span>
                <div className={styles.sectionInfo}>
                  <span className={styles.sectionLabel}>Địa chỉ</span>
                  <span className={styles.sectionValue}>
                    {deliveryAddress || 'Chưa chọn địa chỉ giao hàng'}
                  </span>
                </div>
              </div>
              <span className={styles.sectionChevron}>›</span>
            </button>

            {/* Section: Người nhận */}
            <div className={styles.sectionRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
              <div className={styles.sectionRowLeft}>
                <span className={styles.sectionIcon}>👤</span>
                <span className={styles.sectionLabel}>Thông tin người nhận</span>
              </div>
              <div className={styles.receiverGrid}>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={styles.receiverInput}
                  placeholder="Họ và tên người nhận"
                  required
                />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={styles.receiverInput}
                  placeholder="Số điện thoại liên lạc"
                  required
                />
              </div>
            </div>

            {/* Section: Ghi chú */}
            <div className={styles.sectionRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
              <div className={styles.sectionRowLeft}>
                <span className={styles.sectionIcon}>📝</span>
                <span className={styles.sectionLabel}>Ghi chú cho cửa hàng</span>
              </div>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={styles.notesInput}
                placeholder="Chỉ chú (ví dụ: ít đá, ngọt vừa, giao giờ hành chính...)"
                rows={2}
              />
            </div>

            {/* Section: Thông tin hóa đơn VAT */}
            <div className={styles.vatInfo}>
              <p>- Vui lòng xem hướng dẫn xuất phiếu GTGT (VAT) từ hóa đơn giấy đi kèm món nước.</p>
              <p>- Trường hợp không nhận được hóa đơn giấy, vui lòng liên hệ Hotline CSKH: 1900234518 (nhấn phím 1) hoặc Fanpage Phúc Long Coffee &amp; Tea từ 8h00 - 17h45 để được hỗ trợ trực tiếp.</p>
            </div>

          </form>

          {/* ══ CỘT PHẢI: Giỏ hàng + Thanh toán ══ */}
          <aside className={styles.rightCol}>

            {/* Giỏ hàng */}
            <div className={styles.cartSection}>
              <h3 className={styles.cartTitle}>
                Giỏ hàng của bạn ({cartItems.reduce((s, i) => s + i.quantity, 0)} món)
              </h3>

              <div className={styles.cartList}>
                {cartItems.map((item) => {
                  const itemKey = item.cartKey || item.id;
                  const maxStock = item.stockQuantity ?? 99;
                  return (
                    <div key={itemKey} className={styles.cartItem}>
                      {/* Ảnh sản phẩm */}
                      <div className={styles.cartItemImg}>
                        <img
                          src={getFullImageUrl(item.imageUrl || item.image)}
                          alt={item.name}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>

                      {/* Thông tin */}
                      <div className={styles.cartItemInfo}>
                        <span className={styles.cartItemName}>{item.name}</span>
                        {item.selectedOptions?.length > 0 && (
                          <span className={styles.cartItemOptions}>
                            {item.selectedOptions.map(o => o.name).join(', ')}
                          </span>
                        )}
                        <span className={styles.cartItemPrice}>{formatPrice(item.price)}</span>
                      </div>

                      {/* Nút +/- */}
                      <div className={styles.cartItemQty}>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => updateCartQuantity(itemKey, item.quantity - 1)}
                          aria-label="Giảm"
                        >−</button>
                        <span className={styles.qtyNum}>{item.quantity}</span>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => updateCartQuantity(itemKey, item.quantity + 1)}
                          disabled={item.quantity >= maxStock}
                          aria-label="Tăng"
                        >+</button>
                      </div>

                      {/* Nút xóa */}
                      <button
                        type="button"
                        className={styles.cartItemRemove}
                        onClick={() => removeFromCart(itemKey)}
                        aria-label={`Xóa ${item.name}`}
                      >🗑</button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Thông tin thanh toán */}
            <div className={styles.summarySection}>
              <h4 className={styles.summaryTitle}>Thông tin thanh toán</h4>
              <div className={styles.summaryRow}>
                <span>Tổng tiền tạm tính</span>
                <span>{formatPrice(cartTotalPrice)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Phí vận chuyển</span>
                <span>0 đ</span>
              </div>

              {/* Voucher */}
              <div className={styles.voucherRow}>
                <span>Mã giảm giá</span>
                <div className={styles.voucherInput}>
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
                    className={styles.voucherApplyBtn}
                    onClick={() => { if (voucherCode.trim()) setVoucherApplied(true); }}
                  >
                    Áp dụng
                  </button>
                </div>
                {voucherApplied && (
                  <span className={styles.voucherOk}>✓ Mã "{voucherCode}" đã được áp dụng</span>
                )}
              </div>

              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Tổng tiền (Đã có VAT)</span>
                <span className={styles.totalPrice}>{formatPrice(cartTotalPrice)}</span>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className={styles.paymentSection}>
              <h4 className={styles.summaryTitle}>Phương thức thanh toán</h4>
              {[
                { value: 'card', label: 'Thẻ ngân hàng/Thẻ tín dụng/Ví điện tử' },
                { value: 'momo', label: 'Ví MoMo' },
                { value: 'zalopay', label: 'Ví ZaloPay' },
                { value: 'shopee', label: 'Ví ShopeePay' },
              ].map(({ value, label }) => (
                <label key={value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                    className={styles.radioInput}
                  />
                  {label}
                </label>
              ))}
            </div>

            {/* Điều khoản + Nút thanh toán */}
            <div className={styles.termsSection}>
              <label className={styles.termsLabel}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className={styles.termsCheckbox}
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
                disabled={isSubmitting || !agreedToTerms || cartItems.length === 0}
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
