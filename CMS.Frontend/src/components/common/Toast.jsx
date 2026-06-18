import React from 'react';
import styles from './Toast.module.css';

const Toast = ({ message, type = 'success' }) => {
  const getBadgeClass = () => {
    switch (type) {
      case 'error': return styles.error;
      case 'info': return styles.info;
      case 'warning': return styles.warning;
      default: return styles.success;
    }
  };

  return (
    <div className={`${styles.toast} ${getBadgeClass()}`} role="alert">
      <div className={styles.icon}>
        {type === 'error' && '✕'}
        {type === 'success' && '✓'}
        {type === 'info' && 'ℹ'}
        {type === 'warning' && '⚠'}
      </div>
      <div className={styles.message}>{message}</div>
    </div>
  );
};

export default Toast;
