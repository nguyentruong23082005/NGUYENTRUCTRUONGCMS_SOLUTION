import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import useOrders from '../../hooks/useOrders';
import useCustomers from '../../hooks/useCustomers';
import useProvinces from '../../hooks/useProvinces';
import { validateCheckoutForm } from '../../utils/validators';
import styles from './Checkout.module.css';

const Checkout = () => {
  const { cartItems, cartTotalPrice, clearCart, showToast } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { createOrder, loading: isSubmitting } = useOrders();
  const { getAddresses } = useCustomers();

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [addressLine, setAddressLine] = useState(''); // sá»‘ nhÃ , tÃªn Ä‘Æ°á»ng
  const [notes, setNotes] = useState('');

  // Äá»‹a chá»‰ Ä‘Ã£ lÆ°u
  const [savedAddresses, setSavedAddresses] = useState([]);

  // Cascading dropdown tá»‰nh/quáº­n/phÆ°á»ng
  const {
    provinces, districts, wards,
    province, district, ward,
    setProvince, setDistrict, setWard,
    initFromNames,
    loadingDistricts, loadingWards,
  } = useProvinces();

  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Load danh sÃ¡ch Ä‘á»‹a chá»‰ Ä‘Ã£ lÆ°u (chá»‰ khi Ä‘Äƒng nháº­p)
  useEffect(() => {
    if (isAuthenticated) {
      getAddresses().then(setSavedAddresses).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Äiá»n form tá»« Ä‘á»‹a chá»‰ Ä‘Ã£ lÆ°u
  const handlePickSavedAddress = useCallback((addr) => {
    setFullName(addr.receiverName || '');
    setPhone(addr.receiverPhone || '');
    setAddressLine(addr.addressLine || '');
    initFromNames(addr.province, addr.district, addr.ward);
  }, [initFromNames]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const validateForm = () => {
    const { isValid, errors: tempErrors } = validateCheckoutForm({ fullName, phone, address: addressLine });
    // Kiá»ƒm tra thÃªm tá»‰nh/quáº­n/phÆ°á»ng
    if (!province) tempErrors.province = 'Vui lÃ²ng chá»n Tá»‰nh/ThÃ nh phá»‘';
    if (!district) tempErrors.district = 'Vui lÃ²ng chá»n Quáº­n/Huyá»‡n';
    if (!ward)     tempErrors.ward     = 'Vui lÃ²ng chá»n PhÆ°á»ng/XÃ£';
    const hasError = Object.keys(tempErrors).length > 0;
    setErrors(tempErrors);
    return !hasError && isValid;
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Vui lÃ²ng kiá»ƒm tra láº¡i thÃ´ng tin thanh toÃ¡n!', 'error');
      return;
    }

    // GhÃ©p Ä‘á»‹a chá»‰ Ä‘áº§y Ä‘á»§: chi tiáº¿t + phÆ°á»ng + quáº­n + tá»‰nh
    const shippingAddress = [addressLine, ward?.name, district?.name, province?.name]
      .filter(Boolean)
      .join(', ');

    const orderItems = cartItems.map(item => ({
      productId: Number(item.id),
      quantity: item.quantity,
      optionValueIds: item.optionValueIds || [],
    }));

    const orderPayload = {
      customerAddressId: null,
      receiverName: fullName,
      receiverPhone: phone,
      shippingAddress,
      notes,
      items: orderItems,
    };

    try {
      await createOrder(orderPayload);
      setIsSuccess(true);
      clearCart();
      showToast('Äáº·t hÃ ng thÃ nh cÃ´ng! PhÃºc Long sáº½ liÃªn há»‡ giao hÃ ng sá»›m nháº¥t.');
      setTimeout(() => navigate('/'), 4000);
    } catch (error) {
      console.error('Lá»—i khi gá»­i Ä‘Æ¡n Ä‘áº·t hÃ ng lÃªn API:', error);
      showToast('CÃ³ lá»—i xáº£y ra trong quÃ¡ trÃ¬nh Ä‘áº·t hÃ ng. Vui lÃ²ng thá»­ láº¡i!', 'error');
    }
  };

  if (cartItems.length === 0 && !isSuccess) {
    return (
      <div className={styles.page}>
        <div className="container">
          <Helmet><title>Thanh toÃ¡n - Giá» hÃ ng trá»‘ng</title></Helmet>
          <div className={styles.emptyContainer}>
            <h3>Giá» hÃ ng trá»‘ng</h3>
            <p>Vui lÃ²ng thÃªm sáº£n pháº©m vÃ o giá» hÃ ng trÆ°á»›c khi tiáº¿n hÃ nh thanh toÃ¡n.</p>
            <Link to="/menu" className={styles.backBtn}>Quay láº¡i chá»n mÃ³n</Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={styles.successPage}>
        <Helmet><title>Äáº·t hÃ ng thÃ nh cÃ´ng - Cáº£m Æ¡n quÃ½ khÃ¡ch</title></Helmet>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>ðŸŽ‰</div>
          <h2>Äáº·t HÃ ng ThÃ nh CÃ´ng!</h2>
          <p className={styles.successText}>
            Cáº£m Æ¡n quÃ½ khÃ¡ch <strong>{fullName}</strong> Ä‘Ã£ tin dÃ¹ng sáº£n pháº©m cá»§a PhÃºc Long Heritage.
            ChÃºng tÃ´i sáº½ liÃªn há»‡ xÃ¡c nháº­n Ä‘Æ¡n hÃ ng qua sá»‘ Ä‘iá»‡n thoáº¡i <strong>{phone}</strong> trong giÃ¢y lÃ¡t.
          </p>
          <p className={styles.redirectText}>Há»‡ thá»‘ng Ä‘ang tá»± Ä‘á»™ng Ä‘iá»u hÆ°á»›ng vá» Trang chá»§ sau Ã­t giÃ¢y...</p>
          <Link to="/" className={styles.homeBtn}>Quay láº¡i Trang chá»§ ngay</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Helmet><title>Thanh toÃ¡n Ä‘Æ¡n hÃ ng - PhÃºc Long Coffee &amp; Tea</title></Helmet>

      <div className="container">
        <h1 className={styles.pageTitle}>Thanh ToÃ¡n ÄÆ¡n HÃ ng</h1>

        <div className={styles.layout}>
          {/* â”€â”€ Form Checkout â”€â”€ */}
          <form onSubmit={handleCheckoutSubmit} className={styles.formCard} noValidate>
            <h3 className={styles.sectionTitle}>ThÃ´ng Tin Giao HÃ ng</h3>

            {/* â”€â”€ Äá»‹a chá»‰ Ä‘Ã£ lÆ°u (chá»‰ hiá»‡n khi Ä‘Äƒng nháº­p vÃ  cÃ³ Ä‘á»‹a chá»‰) â”€â”€ */}
            {isAuthenticated && savedAddresses.length > 0 && (
              <>
                <div className={styles.savedAddressBox}>
                  <span className={styles.savedAddressLabel}>ðŸ“ Chá»n tá»« Ä‘á»‹a chá»‰ Ä‘Ã£ lÆ°u</span>
                  <select
                    className={styles.select}
                    defaultValue=""
                    onChange={(e) => {
                      const addr = savedAddresses.find(a => String(a.id) === e.target.value);
                      if (addr) handlePickSavedAddress(addr);
                    }}
                    aria-label="Chá» n Ä‘á»‹a chá»‰ Ä‘Ã£ lÆ°u"
                  >
                    <option value="">Chá» n Ä‘á»‹a chá»‰ Ä‘Ã£ lÆ°u</option>
                    {savedAddresses.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.receiverName} â€” {a.addressLine}, {a.ward}, {a.district}, {a.province}
                      </option>
                    ))}
                  </select>
                  <span className={styles.savedAddressHint}>Chá» n Ä‘á»ƒ tá»± Ä‘á»™ng Ä‘iá» n thÃ´ng tin giao hÃ ng</span>
                </div>
                <div className={styles.addressDivider}>hoáº·c nháº­p thá»§ cÃ´ng</div>
              </>
            )}

            {/* Há»  tÃªn */}
            <div className={styles.formGroup}>
              <label htmlFor="fullName" className={styles.label}>
                Há»  vÃ  tÃªn ngÆ°á» i nháº­n <span className={styles.required}>*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
                placeholder="Nháº­p Ä‘áº§y Ä‘á»§ há»  tÃªn"
              />
              {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
            </div>

            {/* Ä iá»‡n thoáº¡i */}
            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>
                Sá»‘ Ä‘iá»‡n thoáº¡i liÃªn láº¡c <span className={styles.required}>*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                placeholder="Nháº­p sá»‘ Ä‘iá»‡n thoáº¡i di Ä‘á»™ng"
              />
              {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
            </div>

            {/* â”€â”€ Ä á»‹a chá»‰: 3 dropdown cascading â”€â”€ */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Tá»‰nh / Quáº­n / PhÆ°á» ng <span className={styles.required}>*</span>
              </label>
              <div className={styles.addressRow}>
                <select
                  className={`${styles.select} ${errors.province ? styles.inputError : ''}`}
                  value={province?.code ?? ''}
                  onChange={(e) => {
                    const found = e.target.value
                      ? provinces.find(p => String(p.code) === e.target.value)
                      : null;
                    setProvince(found ?? null);
                  }}
                  aria-label="Chá» n Tá»‰nh/ThÃ nh phá»‘"
                >
                  <option value="">Tá»‰nh/ThÃ nh phá»‘</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>

                <select
                  className={`${styles.select} ${errors.district ? styles.inputError : ''}`}
                  value={district?.code ?? ''}
                  onChange={(e) => {
                    const found = e.target.value
                      ? districts.find(d => String(d.code) === e.target.value)
                      : null;
                    setDistrict(found ?? null);
                  }}
                  disabled={!province || loadingDistricts}
                  aria-label="Chá» n Quáº­n/Huyá»‡n"
                >
                  <option value="">
                    {loadingDistricts ? 'Ä ang táº£i...' : 'Quáº­n/Huyá»‡n'}
                  </option>
                  {districts.map(d => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>

                <select
                  className={`${styles.select} ${errors.ward ? styles.inputError : ''}`}
                  value={ward?.code ?? ''}
                  onChange={(e) => {
                    const found = e.target.value
                      ? wards.find(w => String(w.code) === e.target.value)
                      : null;
                    setWard(found ?? null);
                  }}
                  disabled={!district || loadingWards}
                  aria-label="Chá» n PhÆ°á» ng/XÃ£"
                >
                  <option value="">
                    {loadingWards ? 'Ä ang táº£i...' : 'PhÆ°á» ng/XÃ£'}
                  </option>
                  {wards.map(w => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
              </div>
              {(errors.province || errors.district || errors.ward) && (
                <span className={styles.errorText}>
                  {errors.province || errors.district || errors.ward}
                </span>
              )}
            </div>

            {/* Äá»‹a chá»‰ chi tiáº¿t */}
            <div className={styles.formGroup}>
              <label htmlFor="addressLine" className={styles.label}>
                Äá»‹a chá»‰ chi tiáº¿t <span className={styles.required}>*</span>
              </label>
              <input
                id="addressLine"
                type="text"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
                placeholder="Sá»‘ nhÃ , tÃªn Ä‘Æ°á»ng..."
              />
              {errors.address && <span className={styles.errorText} id="address-error">{errors.address}</span>}
            </div>

            {/* Ghi chÃº */}
            <div className={styles.formGroup}>
              <label htmlFor="notes" className={styles.label}>Ghi chÃº Ä‘Æ¡n hÃ ng</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={styles.textarea}
                placeholder="YÃªu cáº§u thÃªm (vÃ­ dá»¥: Ã­t Ä‘Ã¡, ngá»t vá»«a, giao giá» hÃ nh chÃ­nh...)"
                rows="2"
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Äang gá»­i Ä‘Æ¡n hÃ ng...' : 'XÃ¡c nháº­n Ä‘áº·t hÃ ng'}
            </button>
          </form>

          {/* â”€â”€ Cart Review â”€â”€ */}
          <aside className={styles.orderSummary}>
            <h3 className={styles.sectionTitle}>TÃ³m Táº¯t ÄÆ¡n HÃ ng</h3>
            <div className={styles.summaryList}>
              {cartItems.map((item) => (
                <div key={item.cartKey || item.id} className={styles.summaryItem}>
                  <div>
                    <div className={styles.itemTitleQty}>
                      <span>{item.name}</span>
                      <span className={styles.qty}>x{item.quantity}</span>
                    </div>
                    {item.selectedOptions?.length > 0 && (
                      <ul className={styles.optionList}>
                        {item.selectedOptions.map((option) => (
                          <li key={option.id}>
                            {option.name}
                            {option.priceSurcharge > 0 && ` (+${formatPrice(option.priceSurcharge)})`}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className={styles.divider} />

            <div className={styles.summaryRow}>
              <span>Táº¡m tÃ­nh:</span>
              <span>{formatPrice(cartTotalPrice)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>PhÃ­ giao hÃ ng:</span>
              <span className={styles.freeText}>Miá»…n phÃ­</span>
            </div>

            <div className={styles.divider} />

            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Tá»•ng thanh toÃ¡n:</span>
              <span className={styles.totalPrice}>{formatPrice(cartTotalPrice)}</span>
            </div>

            <div className={styles.paymentMethod}>
              <p>ðŸ’µ <strong>PhÆ°Æ¡ng thá»©c thanh toÃ¡n:</strong></p>
              <p className={styles.cod}>Thanh toÃ¡n tiá»n máº·t khi nháº­n hÃ ng (COD)</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

