import React, { useEffect, useState } from 'react';
import useVouchers from '../../hooks/useVouchers';
import styles from '../../pages/Profile/Profile.module.css';

// ── Helpers ────────────────────────────────────────────────
const formatCurrency = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

/**
 * Tab Ưu đãi — danh sách voucher với nút copy mã nhanh
 */
const VoucherList = () => {
  const { getAvailableVouchers, loading } = useVouchers();
  const [vouchers, setVouchers] = useState([]);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    getAvailableVouchers().then(setVouchers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <h2 className={styles.contentTitle}>Ưu đãi của tôi</h2>

      {loading && <p className={styles.emptyState}>Đang tải ưu đãi...</p>}

      {!loading && vouchers.length === 0 && (
        <div className={styles.emptyState}>
          <p>Hiện chưa có ưu đãi nào.</p>
        </div>
      )}

      <div className={styles.voucherGrid}>
        {vouchers.map((v) => {
          const discountLabel = v.isPercent
            ? `Giảm ${v.discountValue}%`
            : `Giảm ${formatCurrency(v.discountValue)}`;

          return (
            <div key={v.id} className={styles.voucherCard}>
              <div className={styles.voucherCardHeader}>
                <span className={styles.voucherBadge}>Voucher</span>
              </div>

              <div className={styles.voucherDiscount}>{discountLabel}</div>

              <div className={styles.voucherMeta}>
                Đơn tối thiểu: {formatCurrency(v.minimumOrderAmount)}
              </div>

              <div className={styles.voucherCode}>
                <span className={styles.voucherCodeText}>{v.code}</span>
                <button
                  type="button"
                  className={styles.voucherCopyBtn}
                  onClick={() => handleCopy(v.code)}
                >
                  {copied === v.code ? '✓ Đã copy' : 'Copy'}
                </button>
              </div>

              <div className={styles.voucherExpiry}>HSD: {formatDate(v.expiryDate)}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default VoucherList;
