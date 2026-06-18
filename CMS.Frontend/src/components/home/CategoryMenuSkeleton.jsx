import React from 'react';
import styles from './CategoryMenuSkeleton.module.css';

const CategoryMenuSkeleton = () => {
  return (
    <div className={styles.container}>
      {Array(5).fill(0).map((_, index) => (
        <div key={index} className={styles.item}>
          <div className={`${styles.circle} shimmer`} />
          <div className={`${styles.text} shimmer`} />
        </div>
      ))}
    </div>
  );
};

export default CategoryMenuSkeleton;
