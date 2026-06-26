import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import styles from './ProductCard.module.css';

const ProductCard = ({ product, badgeLabel }) => {
  const { addToCart } = useCart();
  const [imgFailed, setImgFailed] = React.useState(false);

  const handleBuyClick = (event) => {
    event.preventDefault();
    addToCart(product, 1);
  };

  const hasImage = Boolean((product.imageUrl || product.image) && !imgFailed);
  const imgUrl = product.imageUrl || product.image;
  const ribbonLabel = badgeLabel || product.badgeLabel || '';

  const displayImgUrl = hasImage ? imgUrl : product.productCategoryImageUrl;

  return (
    <Link to={`/product/${product.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={displayImgUrl}
          alt={product.name}
          className={styles.image}
          loading="lazy"
          onError={() => setImgFailed(true)}
        />

        {product.stockQuantity <= 0 && <span className={styles.outOfStockBadge}>Hết hàng</span>}
      </div>

      {ribbonLabel && <div className={styles.ribbonBar}>{ribbonLabel}</div>}

      <div className={styles.content}>
        <h3 className={styles.title}>{product.name}</h3>
        <p className={styles.price}>{formatCurrency(product.price)}</p>
        <button
          type="button"
          onClick={handleBuyClick}
          className={styles.buyButton}
          disabled={product.stockQuantity <= 0}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_shopping_cart</span>
          <span>Đặt mua</span>
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
