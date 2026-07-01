import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useOrders from '../../hooks/useOrders';
import styles from '../../pages/Profile/Profile.module.css';
import localStyles from './OrderedProductsList.module.css';
import { getFullImageUrl } from '../../utils/imageHelper';

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
                image: item.productImageUrl,
                orderedTimes: 1
              };
            } else {
              itemsMap[item.productId].orderedTimes += 1;
              if (!itemsMap[item.productId].image && item.productImageUrl) {
                itemsMap[item.productId].image = item.productImageUrl;
              }
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
        <div className={localStyles.emptyStateContainer}>
          <span className={localStyles.emptyEmoji}>📦</span>
          <p className={localStyles.emptyText}>Bạn chưa từng đặt món nào.</p>
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
        <div className={localStyles.prodGrid}>
          {products.map((product) => (
            <div
              key={product.id}
              className={localStyles.prodCard}
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className={localStyles.imgContainer}>
                {product.image ? (
                  <img 
                    src={getFullImageUrl(product.image)} 
                    alt={product.name} 
                    className={localStyles.prodImage}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextSibling;
                      if (fallback) {
                        fallback.style.display = 'block';
                      }
                    }}
                  />
                ) : null}
                <span 
                  className={localStyles.fallbackEmoji}
                  style={{ display: product.image ? 'none' : 'block' }}
                >
                  🍵
                </span>
              </div>
              <div className={localStyles.infoContainer}>
                <h4 className={localStyles.title}>
                  {product.name}
                </h4>
                <div className={localStyles.bottomRow}>
                  <div className={localStyles.price}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)}
                  </div>
                  <span className={localStyles.badge}>
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

