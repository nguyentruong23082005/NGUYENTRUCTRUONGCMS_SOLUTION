import React, { useCallback, useEffect, useState } from 'react';
import useOrders from '../../hooks/useOrders';
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

const STATUS_MAP = {
  Pending:    { label: 'Chờ xử lý',  cls: styles.statusPending },
  Processing: { label: 'Đang xử lý', cls: styles.statusProcessing },
  Shipping:   { label: 'Đang giao',  cls: styles.statusShipping },
  Delivered:  { label: 'Đã giao',    cls: styles.statusDelivered },
  Cancelled:  { label: 'Đã hủy',     cls: styles.statusCancelled },
};

/**
 * Tab Đơn hàng — lịch sử đơn hàng với accordion chi tiết và nút hủy
 */
const OrderList = () => {
  const { getOrderHistory, cancelOrder, loading } = useOrders();
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [msg, setMsg] = useState(null);

  const reload = useCallback(() => {
    getOrderHistory({ page: 1, pageSize: 20 }).then(setOrders);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    setMsg(null);
    try {
      await cancelOrder(id);
      setMsg({ type: 'success', text: 'Hủy đơn hàng thành công!' });
      reload();
    } catch {
      setMsg({ type: 'error', text: 'Không thể hủy đơn hàng. Vui lòng thử lại.' });
    }
  };

  return (
    <>
      <h2 className={styles.contentTitle}>Lịch sử đơn hàng</h2>

      {msg && (
        <div
          className={msg.type === 'success' ? styles.successMsg : styles.errorMsg}
          style={{ marginBottom: 16 }}
        >
          {msg.text}
        </div>
      )}

      {loading && <p className={styles.emptyState}>Đang tải đơn hàng...</p>}

      {!loading && orders.length === 0 && (
        <div className={styles.emptyState}>
          <p>Bạn chưa có đơn hàng nào.</p>
        </div>
      )}

      <div className={styles.orderList}>
        {orders.map((order) => {
          const status = STATUS_MAP[order.status] || { label: order.status, cls: '' };
          const isExpanded = expandedId === order.id;

          return (
            <div key={order.id} className={styles.orderCard}>
              {/* ── Header accordion ── */}
              <div
                className={styles.orderCardHeader}
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                role="button"
                aria-expanded={isExpanded}
              >
                <div className={styles.orderMeta}>
                  <span className={styles.orderId}>#{order.id}</span>
                  <span className={styles.orderDate}>{formatDate(order.orderDate)}</span>
                </div>

                <div className={styles.orderCardRight}>
                  <span className={`${styles.orderStatusBadge} ${status.cls}`}>
                    {status.label}
                  </span>
                  <span className={styles.orderTotal}>
                    {formatCurrency(order.totalAmount)}
                  </span>
                  <span className={styles.toggleChevron}>{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* ── Body chi tiết ── */}
              {isExpanded && (
                <div className={styles.orderCardBody}>
                  <div className={styles.orderProductList}>
                    {(order.items || []).map((item) => (
                      <div key={item.id} className={styles.orderProduct}>
                        <div className={styles.orderProductName}>
                          {item.productName} × {item.quantity}
                          {item.options && item.options.length > 0 && (
                            <div className={styles.orderProductOptions}>
                              {item.options.map((o) => o.name).join(', ')}
                            </div>
                          )}
                        </div>
                        <span className={styles.orderProductPrice}>
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.orderFooter}>
                    <div className={styles.orderSummary}>
                      Giao tới: {order.shippingAddress || '—'}
                      {order.discountAmount > 0 && (
                        <div>Giảm giá: -{formatCurrency(order.discountAmount)}</div>
                      )}
                      <div className={styles.orderSummaryTotal}>
                        Tổng cộng: {formatCurrency(order.totalAmount)}
                      </div>
                    </div>

                    {order.status === 'Pending' && (
                      <button
                        type="button"
                        className={styles.btnCancel}
                        onClick={() => handleCancel(order.id)}
                        disabled={loading}
                      >
                        Hủy đơn
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default OrderList;
