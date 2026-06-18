import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import styles from './FloatingActions.module.css';

const FloatingActions = () => {
  const { cartTotalQuantity, isCartAnimating } = useCart();
  const chatUrl = import.meta.env.VITE_ZALO_URL;
  const chatLabel = import.meta.env.VITE_ZALO_LABEL;

  return (
    <div className={styles.floatingActions} aria-label="Lối tắt mua hàng">
      <Link
        to="/cart"
        className={`${styles.cartButton} ${isCartAnimating ? styles.bounce : ''}`}
        aria-label={`Giỏ hàng có ${cartTotalQuantity} sản phẩm`}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.cartIcon}>
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="17" cy="20" r="1.4" />
          <path d="M3 4h2.2l2.3 10.5a2 2 0 0 0 2 1.5h7.8a2 2 0 0 0 1.9-1.4L21 8H7" />
        </svg>
        {cartTotalQuantity > 0 && (
          <span className={styles.cartBadge}>{cartTotalQuantity}</span>
        )}
      </Link>

      {chatUrl && chatLabel && (
        <a
          href={chatUrl}
          target="_blank"
          rel="noreferrer"
          className={styles.chatButton}
          aria-label="Liên hệ"
        >
          {chatLabel}
        </a>
      )}
    </div>
  );
};

export default FloatingActions;
