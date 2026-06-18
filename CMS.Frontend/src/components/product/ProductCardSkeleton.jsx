import React from 'react';
import styles from './ProductCardSkeleton.module.css';

const ProductCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={`${styles.image} shimmer`} />
      <div className={styles.content}>
        <div className={`${styles.title} shimmer`} />
        <div className={`${styles.price} shimmer`} />
        <div className={`${styles.button} shimmer`} />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
