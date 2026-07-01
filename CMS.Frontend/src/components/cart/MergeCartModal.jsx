import React from 'react';
import { useCart } from '../../context/CartContext';
import styles from './MergeCartModal.module.css';

const MergeCartModal = () => {
  const { guestCartCount, handleMergeCart } = useCart();

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h3 id="modal-title" className={styles.title}>Đồng bộ giỏ hàng</h3>
        <p className={styles.text}>
          Bạn có <strong>{guestCartCount}</strong> sản phẩm trong giỏ hàng tạm thời. 
          Bạn có muốn thêm các sản phẩm này vào giỏ hàng thành viên hiện tại của mình không?
        </p>
        <div className={styles.actions}>
          <button 
            type="button" 
            className={`${styles.button} ${styles.confirmBtn}`}
            onClick={() => handleMergeCart(true)}
          >
            Đồng ý (Merge)
          </button>
          <button 
            type="button" 
            className={`${styles.button} ${styles.cancelBtn}`}
            onClick={() => handleMergeCart(false)}
          >
            Không (Bỏ qua)
          </button>
        </div>
      </div>
    </div>
  );
};

export default MergeCartModal;
