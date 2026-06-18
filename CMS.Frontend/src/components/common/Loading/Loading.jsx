import React from 'react';
import styles from './Loading.module.css';

const Loading = ({ fullPage = false }) => {
  return (
    <div className={`${styles.container} ${fullPage ? styles.fullPage : ''}`}>
      <div className={styles.spinner} role="status" aria-live="polite">
        <span className="sr-only">Đang tải...</span>
      </div>
    </div>
  );
};

export default Loading;
