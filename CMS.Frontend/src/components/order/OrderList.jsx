import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, MapPin, Phone, User, Search } from 'lucide-react';
import useOrders from '../../hooks/useOrders';
import styles from '../../pages/Profile/Profile.module.css';
import { getFullImageUrl } from '../../utils/imageHelper';

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
  Pending:        { label: 'Chờ xử lý',  cls: styles.statusPending },
  Confirmed:      { label: 'Đã xác nhận', cls: styles.statusProcessing },
  Preparing:      { label: 'Đang chuẩn bị', cls: styles.statusProcessing },
  Ready:          { label: 'Sẵn sàng', cls: styles.statusProcessing },
  OutForDelivery: { label: 'Đang giao',  cls: styles.statusShipping },
  Delivered:      { label: 'Đã giao',    cls: styles.statusDelivered },
  Completed:      { label: 'Hoàn thành', cls: styles.statusDelivered },
  Cancelled:      { label: 'Đã hủy',     cls: styles.statusCancelled },
};

const FILTER_TABS = [
  { key: 'Pending',        label: 'CHỜ THANH TOÁN' },
  { key: 'Confirmed',      label: 'ĐƠN HÀNG MỚI' },
  { key: 'Preparing',      label: 'ĐANG XỬ LÝ' },
  { key: 'OutForDelivery', label: 'ĐANG GIAO' },
  { key: 'Completed',      label: 'HOÀN THÀNH' },
  { key: 'Cancelled',      label: 'HUỶ' },
];

/**
 * Tab Đơn hàng — lịch sử đơn hàng với bộ lọc trạng thái, thanh tìm kiếm mã đơn hàng và phân trang tích hợp BE.
 */
const OrderList = () => {
  const navigate = useNavigate();
  const { getOrderHistory, cancelOrder, loading } = useOrders();
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [msg, setMsg] = useState(null);

  // Bộ lọc, tìm kiếm và phân trang
  const [activeFilter, setActiveFilter] = useState('Pending');
  const [inputVal, setInputVal] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const pageSize = 10;

  const loadOrders = useCallback(() => {
    getOrderHistory({
      page,
      pageSize,
      status: activeFilter,
      searchKeyword: searchKeyword.trim() || undefined
    }).then((res) => {
      setOrders(res || []);
      setHasNextPage((res || []).length === pageSize);
    }).catch(() => {
      setOrders([]);
      setHasNextPage(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeFilter, searchKeyword]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchKeyword(inputVal);
    setPage(1);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    setMsg(null);
    try {
      await cancelOrder(id);
      setMsg({ type: 'success', text: 'Hủy đơn hàng thành công!' });
      loadOrders();
    } catch {
      setMsg({ type: 'error', text: 'Không thể hủy đơn hàng. Vui lòng thử lại.' });
    }
  };

  return (
    <>
      <h2 className={styles.contentTitle} style={{ marginBottom: 16 }}>Lịch sử đơn hàng</h2>

      {/* ── Bộ lọc trạng thái & Thanh tìm kiếm ── */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 16, 
          borderBottom: '1px solid #ECEFF1',
          marginBottom: 24,
          paddingBottom: 0
        }}
      >
        {/* Tabs bộ lọc bên trái */}
        <div 
          style={{ 
            display: 'flex', 
            gap: 20, 
            overflowX: 'auto',
            scrollbarWidth: 'none',
            marginRight: 16
          }}
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveFilter(tab.key);
                setPage(1);
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 0',
                fontSize: 13,
                fontWeight: activeFilter === tab.key ? 700 : 500,
                color: activeFilter === tab.key ? '#006F3C' : '#9B9B9B',
                borderBottom: activeFilter === tab.key ? '2px solid #006F3C' : '2px solid transparent',
                marginBottom: -1,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tìm kiếm bên phải */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 280, position: 'relative', marginBottom: 10 }}>
          <span style={{ position: 'absolute', left: 14, color: '#9B9B9B', display: 'flex', alignItems: 'center' }}>
            <Search size={16} strokeWidth={2} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 16px 8px 38px',
              borderRadius: 20,
              border: 'none',
              background: '#ECEFF1',
              fontSize: 13,
              color: '#333333',
              outline: 'none',
            }}
          />
        </form>
      </div>

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
        <div className={styles.emptyState} style={{ padding: '60px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 20, color: '#006F3C', fontWeight: 600, marginBottom: 8 }}>Không có đơn hàng nào</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
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
                            <div 
                              className={styles.orderProductIconWrapper}
                              onClick={() => navigate(`/product/${item.productId}`)}
                              style={{ cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Xem chi tiết sản phẩm"
                            >
                              {item.productImageUrl ? (
                                <img 
                                  src={getFullImageUrl(item.productImageUrl)} 
                                  alt={item.productName} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                              ) : (
                                <Coffee size={20} strokeWidth={1.5} />
                              )}
                            </div>
                            <div className={styles.orderProductInfo}>
                              <div className={styles.orderProductName}>
                                <span 
                                  onClick={() => navigate(`/product/${item.productId}`)}
                                  style={{ cursor: 'pointer', color: '#0C713D', textDecoration: 'underline', fontWeight: 600 }}
                                  title="Xem chi tiết sản phẩm"
                                >
                                  {item.productName}
                                </span>{' '}
                                <span style={{ color: '#666666' }}>× {item.quantity}</span>
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
      )}

      {/* ── Phân trang ── */}
      {!loading && (orders.length > 0 || page > 1) && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 32 }}>
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            style={{
              background: 'none',
              border: 'none',
              color: page === 1 ? '#CCCCCC' : '#666666',
              cursor: page === 1 ? 'default' : 'pointer',
              fontSize: 16,
              fontWeight: 700,
              padding: 8,
              outline: 'none'
            }}
          >
            &lt;
          </button>

          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#ECEFF1',
              color: '#333333',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {page}
          </span>

          <button
            type="button"
            disabled={!hasNextPage}
            onClick={() => setPage(p => p + 1)}
            style={{
              background: 'none',
              border: 'none',
              color: !hasNextPage ? '#CCCCCC' : '#666666',
              cursor: !hasNextPage ? 'default' : 'pointer',
              fontSize: 16,
              fontWeight: 700,
              padding: 8,
              outline: 'none'
            }}
          >
            &gt;
          </button>
        </div>
      )}
    </>
  );
};

export default OrderList;
