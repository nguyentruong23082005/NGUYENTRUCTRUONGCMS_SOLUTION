import React from 'react';
import styles from './EmptyState.module.css';

const EmptyState = ({ 
  title = "Không tìm thấy dữ liệu", 
  description = "Hiện tại không có mục nào để hiển thị.", 
  actionText, 
  onAction 
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>📭</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {actionText && onAction && (
        <button type="button" onClick={onAction} className={styles.button}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
