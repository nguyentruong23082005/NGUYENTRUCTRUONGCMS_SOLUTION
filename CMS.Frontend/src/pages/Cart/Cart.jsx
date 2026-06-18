import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../../context/CartContext';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import styles from './Cart.module.css'; // Keep CSS module import or update if needed

const Cart = () => {
  const { 
    cartItems, 
    updateCartQuantity, 
    removeFromCart, 
    cartTotalPrice, 
    cartTotalQuantity 
  } = useCart();
  
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (cartItems.length === 0) {
    return (
      <div className={styles.page}>
        <Helmet>
          <title>Giỏ hàng trống - Phúc Long Coffee & Tea</title>
        </Helmet>
        <div className="container">
          <EmptyState 
            title="Giỏ hàng của bạn đang trống" 
            description="Bạn chưa thêm sản phẩm nước uống nào vào giỏ hàng." 
            actionText="Quay lại Thực đơn"
            onAction={() => navigate('/menu')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Helmet>
        <title>{`Giỏ hàng (${cartTotalQuantity}) - Phúc Long Coffee & Tea`}</title>
      </Helmet>

      <div className="container">
        <h1 className={styles.pageTitle}>Giỏ Hàng Của Bạn</h1>

        <div className={styles.layout}>
          {/* Cart Items List */}
          <div className={styles.itemsList}>
            {cartItems.map((item) => {
              const maxStock = item.stockQuantity ?? 99;
              const itemKey = item.cartKey || item.id;
              return (
                <div key={itemKey} className={styles.itemCard}>
                  {/* Image */}
                  <div className={styles.imageWrapper}>
                    <img src={item.imageUrl} alt={item.name} className={styles.image} />
                  </div>

                  {/* Info */}
                  <div className={styles.info}>
                    <h3 className={styles.itemName}>
                      <Link to={`/product/${item.id}`}>{item.name}</Link>
                    </h3>
                    <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                    <p className={styles.stockStatus}>
                      Kho: {maxStock > 0 ? `Còn ${maxStock} sản phẩm` : 'Hết hàng'}
                    </p>
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

                  {/* Quantity Controller (Mã số 28 & 42) */}
                  <div className={styles.quantityContainer}>
                    <div className={styles.qtySelector}>
                      <button 
                        type="button" 
                        className={styles.qtyBtn}
                        onClick={() => updateCartQuantity(itemKey, item.quantity - 1)}
                        aria-label="Giảm số lượng"
                      >
                        -
                      </button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button 
                        type="button" 
                        className={styles.qtyBtn}
                        onClick={() => updateCartQuantity(itemKey, item.quantity + 1)}
                        disabled={item.quantity >= maxStock}
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>
                    {item.quantity >= maxStock && (
                      <span className={styles.limitWarning}>Đạt giới hạn tồn kho</span>
                    )}
                  </div>

                  {/* Subtotal */}
                  <div className={styles.subtotalArea}>
                    <p className={styles.subtotalPrice}>{formatPrice(item.price * item.quantity)}</p>
                  </div>

                  {/* Remove action */}
                  <button 
                    type="button" 
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(itemKey)}
                    aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              );
            })}
          </div>

          {/* Cart Summary Card */}
          <aside className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Đơn Hàng Tạm Tính</h3>
            <div className={styles.summaryRow}>
              <span>Số lượng món:</span>
              <strong>{cartTotalQuantity} ly</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Tạm tính:</span>
              <strong>{formatPrice(cartTotalPrice)}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Phí vận chuyển:</span>
              <strong className={styles.freeShipping}>Miễn phí</strong>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Tổng cộng:</span>
              <span className={styles.totalPrice}>{formatPrice(cartTotalPrice)}</span>
            </div>
            
            <Link to="/checkout" className={styles.checkoutBtn}>
              Tiến hành đặt hàng
            </Link>
            <Link to="/menu" className={styles.continueShopping}>
              &larr; Tiếp tục chọn món
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;
