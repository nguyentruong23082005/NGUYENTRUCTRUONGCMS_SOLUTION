import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import orderApi from '../../api/orderApi';
import styles from './Checkout.module.css';

const Checkout = () => {
  const { cartItems, cartTotalPrice, clearCart, showToast } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [address, setAddress] = useState(user?.address || '');
  const [notes, setNotes] = useState('');

  // Validation errors state (Mã số 29)
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
    if (!address.trim()) tempErrors.address = 'Địa chỉ nhận hàng không được để trống';

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

    const orderItems = cartItems.map(item => ({
      productId: Number(item.id),
      quantity: item.quantity,
      optionValueIds: item.optionValueIds || []
    }));

    const orderPayload = {
      customerAddressId: null,
      receiverName: fullName,
      receiverPhone: phone,
      shippingAddress: address,
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

            {/* Họ tên (Mã số 29) */}
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

            {/* Điện thoại (Mã số 29) */}
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

            {/* Địa chỉ (Mã số 29) */}
            <div className={styles.formGroup}>
              <label htmlFor="address" className={styles.label}>
                Địa chỉ giao hàng <span className={styles.required}>*</span>
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`${styles.textarea} ${errors.address ? styles.inputError : ''}`}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh thành..."
                rows="3"
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
