import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleBuyClick = (event) => {
    event.preventDefault();
    addToCart(product, 1);
  };

  const hasImage = Boolean(product.imageUrl || product.image);
  const imgUrl = product.imageUrl || product.image;
  const ribbonLabel = product.badgeLabel || (product.isBestSeller ? 'Best Seller' : '');

  return (
    <Link to={`/product/${product.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {hasImage ? (
          <img src={imgUrl} alt={product.name} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.imagePlaceholder} aria-label="Sản phẩm chưa có ảnh">
            <span>PHÚC LONG</span>
          </div>
        )}

        {ribbonLabel && <span className={styles.ribbon}>{ribbonLabel}</span>}
        {product.stockQuantity <= 0 && <span className={styles.outOfStockBadge}>Hết hàng</span>}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{product.name}</h3>
        <p className={styles.price}>{formatCurrency(product.price)}</p>
        <button type="button" onClick={handleBuyClick} className={styles.button} disabled={product.stockQuantity <= 0}>
          {product.stockQuantity > 0 && (
            <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.buttonIcon}>
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="17" cy="20" r="1.4" />
              <path d="M3 4h2.2l2.3 10.5a2 2 0 0 0 2 1.5h7.8a2 2 0 0 0 1.9-1.4L21 8H7" />
            </svg>
          )}
          {product.stockQuantity <= 0 ? 'Tạm hết hàng' : 'Đặt mua'}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
