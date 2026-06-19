import React, { useCallback, useEffect, useState } from 'react';
import { Coffee, MapPin, Phone, User } from 'lucide-react';
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
                  <div className={styles.orderDetailGrid}>
                    {/* Cột trái: Sản phẩm */}
                    <div className={styles.orderProductsSection}>
                      {(order.items || []).map((item) => (
                        <div key={item.id} className={styles.orderProductItem}>
                          <div className={styles.orderProductIconWrapper}>
                            <Coffee size={20} strokeWidth={1.5} />
                          </div>
                          <div className={styles.orderProductInfo}>
                            <div className={styles.orderProductName}>
                              <strong>{item.productName}</strong> × {item.quantity}
                            </div>
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

                    {/* Cột phải: Thông tin giao nhận & thanh toán */}
                    <div className={styles.orderInfoSection}>
                      <div className={styles.orderInfoCard}>
                        <div className={styles.orderInfoCardTitle}>Thông Tin Giao Nhận</div>
                        <div className={styles.orderInfoRow}>
                          <User size={16} strokeWidth={1.5} />
                          <span>{order.receiverName || 'Chưa cập nhật người nhận'}</span>
                        </div>
                        <div className={styles.orderInfoRow}>
                          <Phone size={16} strokeWidth={1.5} />
                          <span>{order.receiverPhone || 'Chưa cập nhật SĐT'}</span>
                        </div>
                        <div className={styles.orderInfoRow}>
                          <MapPin size={16} strokeWidth={1.5} />
                          <span>{order.shippingAddress || 'Chưa cập nhật địa chỉ'}</span>
                        </div>
                      </div>

                      <div className={styles.orderInfoCard}>
                        <div className={styles.orderInfoCardTitle}>Tóm Tắt Thanh Toán</div>
                        <div className={styles.orderPaymentSection}>
                          <div className={styles.paymentRow}>
                            <span>Tạm tính:</span>
                            <span>{formatCurrency(order.totalAmount + order.discountAmount)}</span>
                          </div>
                          {order.discountAmount > 0 && (
                            <div className={styles.paymentRow}>
                              <span>Khuyến mãi (Voucher):</span>
                              <span style={{ color: '#B71C1C' }}>-{formatCurrency(order.discountAmount)}</span>
                            </div>
                          )}
                          <div className={styles.paymentTotalRow}>
                            <span>Tổng cộng:</span>
                            <span>{formatCurrency(order.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.orderFooter}>
                    <div className={styles.orderSummary}>
                      {order.notes && <div><strong>Ghi chú:</strong> {order.notes}</div>}
                    </div>

                    {order.status === 'Pending' && (
                      <button
                        type="button"
                        className={styles.btnCancel}
                        onClick={() => handleCancel(order.id)}
                        disabled={loading}
                      >
                        Hủy đơn hàng
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
