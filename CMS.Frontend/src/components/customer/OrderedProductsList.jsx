import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useOrders from '../../hooks/useOrders';
import styles from '../../pages/Profile/Profile.module.css';

const OrderedProductsList = () => {
  const { getOrderHistory, loading } = useOrders();
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getOrderHistory({ page: 1, pageSize: 50 }).then((orders) => {
      if (!orders || orders.length === 0) return;
      // Trích xuất các món ăn từ lịch sử đơn hàng
      const itemsMap = {};
      orders.forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            if (!itemsMap[item.productId]) {
              itemsMap[item.productId] = {
                id: item.productId,
                name: item.productName,
                price: item.basePrice,
                orderedTimes: 1
              };
            } else {
              itemsMap[item.productId].orderedTimes += 1;
            }
          });
        }
      });
      setProducts(Object.values(itemsMap));
    }).catch(err => {
      console.error(err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h2 className={styles.contentTitle}>Sản phẩm đã đặt</h2>

      {loading && <p className={styles.emptyState}>Đang tải sản phẩm...</p>}

      {!loading && products.length === 0 && (
        <div className={styles.emptyState} style={{ padding: '48px 0', textAlign: 'center' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>📦</span>
          <p style={{ fontSize: 15, color: '#666666', marginBottom: 20 }}>Bạn chưa từng đặt món nào.</p>
          <button 
            type="button" 
            className={styles.btnPrimary}
            onClick={() => navigate('/menu')}
          >
            Đặt món ngay
          </button>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {products.map((product) => (
            <div 
              key={product.id} 
              style={{
                border: '1px solid #ECEFF1',
                borderRadius: 8,
                overflow: 'hidden',
                background: '#FFFFFF',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div style={{ height: 160, background: '#ECEFF1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 44 }}>🍵</span>
              </div>
              <div style={{ padding: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#333333', marginBottom: 8, height: 40, overflow: 'hidden' }}>
                  {product.name}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#006F3C' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)}
                  </div>
                  <span style={{ fontSize: 11, background: '#ECEFF1', color: '#666666', padding: '2px 8px', borderRadius: 10 }}>
                    Đã đặt {product.orderedTimes} lần
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default OrderedProductsList;
