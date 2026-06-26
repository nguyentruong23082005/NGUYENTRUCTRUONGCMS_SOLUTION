import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';
import orderApi from '../../api/orderApi';
import useCustomers from '../../hooks/useCustomers';
import useProvinces from '../../hooks/useProvinces';
import { mapOldAdministrativeNames } from '../../utils/addressMapper';
import styles from './Checkout.module.css';

const Checkout = () => {
  const { cartItems, cartTotalPrice, clearCart, showToast } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { deliveryType, structuredAddress } = useDelivery();
  const navigate = useNavigate();
  const { getAddresses } = useCustomers();

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [addressLine, setAddressLine] = useState(''); // số nhà, tên đường
  const [notes, setNotes] = useState('');

  // Danh sách địa chỉ đã lưu
  const [savedAddresses, setSavedAddresses] = useState([]);

  // Cascading dropdown tỉnh/quận/phường
  const {
    provinces, districts, wards,
    province, district, ward,
    setProvince, setDistrict, setWard,
    initFromNames,
    loadingDistricts, loadingWards,
  } = useProvinces();

  // Tự động điền địa chỉ từ định vị Header khi vào trang Checkout
  useEffect(() => {
    if (deliveryType === 'delivery' && structuredAddress) {
      setAddressLine(structuredAddress.street || '');
      initFromNames(
        structuredAddress.province,
        structuredAddress.district,
        structuredAddress.ward
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryType, structuredAddress]);

  // Validation errors state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Load danh sách địa chỉ đã lưu (chỉ khi đã đăng nhập)
  useEffect(() => {
    if (isAuthenticated) {
      getAddresses().then(setSavedAddresses).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Điền form tự động từ địa chỉ đã lưu
  const handlePickSavedAddress = useCallback((addr) => {
    setFullName(addr.receiverName || '');
    setPhone(addr.receiverPhone || '');
    setAddressLine(addr.addressLine || '');
    initFromNames(addr.province, addr.district, addr.ward);
  }, [initFromNames]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!fullName.trim()) tempErrors.fullName = 'Họ tên không được để trống';
    if (!phone.trim()) {
      tempErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(phone.trim())) {
      tempErrors.phone = 'Số điện thoại không hợp lệ (yêu cầu 10-11 chữ số)';
    }
    if (!addressLine.trim()) tempErrors.address = 'Địa chỉ chi tiết không được để trống';
    if (!province) tempErrors.province = 'Vui lòng chọn Tỉnh/Thành phố';
    if (!district) tempErrors.district = 'Vui lòng chọn Quận/Huyện';
    if (!ward)     tempErrors.ward     = 'Vui lòng chọn Phường/Xã';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Vui lòng kiểm tra lại thông tin thanh toán!', 'error');
      return;
    }

    setIsSubmitting(true);

    // Ghép địa chỉ đầy đủ để gửi lên server
    const shippingAddress = [addressLine, ward?.name, district?.name, province?.name]
      .filter(Boolean)
      .join(', ');

    const orderItems = cartItems.map(item => ({
      productId: Number(item.id),
      quantity: item.quantity,
      optionValueIds: item.optionValueIds || []
    }));

    const orderPayload = {
      customerAddressId: null,
      receiverName: fullName,
      receiverPhone: phone,
      shippingAddress,
      notes,
      items: orderItems
    };

    try {
      // Gọi API thực tế thông qua orderApi
      await orderApi.create(orderPayload);
      
      // Đặt hàng thành công
      setIsSuccess(true);
      clearCart();
      showToast('Đặt hàng thành công! Phúc Long sẽ liên hệ giao hàng sớm nhất.');
      
      // Tự động chuyển hướng về trang chủ sau 4 giây
      setTimeout(() => {
        navigate('/');
      }, 4000);
    } catch (error) {
      console.error('Lỗi khi gửi đơn đặt hàng lên API:', error);
      showToast('Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !isSuccess) {
    return (
      <div className={styles.page}>
        <div className="container">
          <Helmet>
            <title>Thanh toán - Giỏ hàng trống</title>
          </Helmet>
          <div className={styles.emptyContainer}>
            <h3>Giỏ hàng trống</h3>
            <p>Vui lòng thêm sản phẩm vào giỏ hàng trước khi tiến hành thanh toán.</p>
            <Link to="/menu" className={styles.backBtn}>Quay lại chọn món</Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={styles.successPage}>
        <Helmet>
          <title>Đặt hàng thành công - Cảm ơn quý khách</title>
        </Helmet>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>🎉</div>
          <h2>Đặt Hàng Thành Công!</h2>
          <p className={styles.successText}>
            Cảm ơn quý khách <strong>{fullName}</strong> đã tin dùng sản phẩm của Phúc Long Heritage.
            Chúng tôi sẽ liên hệ xác nhận đơn hàng qua số điện thoại <strong>{phone}</strong> trong giây lát.
          </p>
          <p className={styles.redirectText}>
            Hệ thống đang tự động điều hướng về Trang chủ sau ít giây...
          </p>
          <Link to="/" className={styles.homeBtn}>Quay lại Trang chủ ngay</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Thanh toán đơn hàng - Phúc Long Coffee & Tea</title>
      </Helmet>

      <div className="container">
        <h1 className={styles.pageTitle}>Thanh Toán Đơn Hàng</h1>

        <div className={styles.layout}>
          {/* Form Checkout */}
          <form onSubmit={handleCheckoutSubmit} className={styles.formCard} noValidate>
            <h3 className={styles.sectionTitle}>Thông Tin Giao Hàng</h3>

            {/* Chọn từ địa chỉ đã lưu (chỉ hiện khi đăng nhập và có địa chỉ lưu sẵn) */}
            {isAuthenticated && savedAddresses.length > 0 && (
              <>
                <div className={styles.savedAddressBox}>
                  <span className={styles.savedAddressLabel}>📍 Chọn từ địa chỉ đã lưu</span>
                  <select
                    className={styles.select}
                    defaultValue=""
                    onChange={(e) => {
                      const addr = savedAddresses.find(a => String(a.id) === e.target.value);
                      if (addr) handlePickSavedAddress(addr);
                    }}
                    aria-label="Chọn địa chỉ đã lưu"
                  >
                    <option value="">Chọn địa chỉ đã lưu</option>
                    {savedAddresses.map(a => {
                      const { districtName, wardName } = mapOldAdministrativeNames(a.district, a.ward);
                      return (
                        <option key={a.id} value={a.id}>
                          {a.receiverName} — {a.addressLine}, {wardName}, {districtName}, {a.province}
                        </option>
                      );
                    })}
                  </select>
                  <span className={styles.savedAddressHint}>Chọn để tự động điền thông tin giao hàng</span>
                </div>
                <div className={styles.addressDivider}>hoặc nhập thủ công</div>
              </>
            )}

            {/* Họ tên */}
            <div className={styles.formGroup}>
              <label htmlFor="fullName" className={styles.label}>
                Họ và tên người nhận <span className={styles.required}>*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
                placeholder="Nhập đầy đủ họ tên"
              />
              {errors.fullName && (
                <span className={styles.errorText} id="fullname-error">{errors.fullName}</span>
              )}
            </div>

            {/* Điện thoại */}
            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>
                Số điện thoại liên lạc <span className={styles.required}>*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                placeholder="Nhập số điện thoại di động"
              />
              {errors.phone && (
                <span className={styles.errorText} id="phone-error">{errors.phone}</span>
              )}
            </div>

            {/* Địa chỉ: 3 dropdown cascading */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Tỉnh / Quận / Phường <span className={styles.required}>*</span>
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
                  aria-label="Chọn Tỉnh/Thành phố"
                >
                  <option value="">Chọn Tỉnh/Thành phố</option>
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
                  aria-label="Chọn Quận/Huyện"
                >
                  <option value="">
                    {loadingDistricts ? 'Đang tải...' : 'Chọn Quận/Huyện'}
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
                  aria-label="Chọn Phường/Xã"
                >
                  <option value="">
                    {loadingWards ? 'Đang tải...' : 'Chọn Phường/Xã'}
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

            {/* Địa chỉ chi tiết */}
            <div className={styles.formGroup}>
              <label htmlFor="addressLine" className={styles.label}>
                Địa chỉ chi tiết <span className={styles.required}>*</span>
              </label>
              <input
                id="addressLine"
                type="text"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
                placeholder="Số nhà, tên đường..."
              />
              {errors.address && (
                <span className={styles.errorText} id="address-error">{errors.address}</span>
              )}
            </div>

            {/* Ghi chú */}
            <div className={styles.formGroup}>
              <label htmlFor="notes" className={styles.label}>Ghi chú đơn hàng</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={styles.textarea}
                placeholder="Yêu cầu thêm (ví dụ: ít đá, ngọt vừa, giao giờ hành chính...)"
                rows="2"
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang gửi đơn hàng...' : 'Xác nhận đặt hàng'}
            </button>
          </form>

          {/* Cart Review */}
          <aside className={styles.orderSummary}>
            <h3 className={styles.sectionTitle}>Tóm Tắt Đơn Hàng</h3>
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
              <span>Tạm tính:</span>
              <span>{formatPrice(cartTotalPrice)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Phí giao hàng:</span>
              <span className={styles.freeText}>Miễn phí</span>
            </div>
            
            <div className={styles.divider} />

            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Tổng thanh toán:</span>
              <span className={styles.totalPrice}>{formatPrice(cartTotalPrice)}</span>
            </div>

            <div className={styles.paymentMethod}>
              <p>💵 <strong>Phương thức thanh toán:</strong></p>
              <p className={styles.cod}>Thanh toán tiền mặt khi nhận hàng (COD)</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
