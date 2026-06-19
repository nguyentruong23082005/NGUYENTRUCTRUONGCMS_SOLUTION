import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { CartIcon } from '../../common/Icons';
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
        <CartIcon className={styles.cartIcon} />
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
