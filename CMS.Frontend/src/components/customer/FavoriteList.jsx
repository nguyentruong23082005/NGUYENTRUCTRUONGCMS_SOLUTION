import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../pages/Profile/Profile.module.css';
import localStyles from './FavoriteList.module.css';

const FavoriteList = () => {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('pl_favorites') || '[]');
      setFavorites(favs);
    } catch {
      setFavorites([]);
    }
  }, []);

  const handleRemove = (productId) => {
    const updated = favorites.filter(item => item.id !== productId);
    setFavorites(updated);
    localStorage.setItem('pl_favorites', JSON.stringify(updated));
  };

  return (
    <>
      <h2 className={styles.contentTitle}>Sản phẩm yêu thích</h2>

      {favorites.length === 0 ? (
        <div className={localStyles.emptyStateContainer}>
          <span className={localStyles.emptyEmoji}>❤️</span>
          <p className={localStyles.emptyText}>Bạn chưa thích sản phẩm nào.</p>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => navigate('/menu')}
          >
            Khám phá thực đơn ngay
          </button>
        </div>
      ) : (
        <div className={localStyles.favGrid}>
          {favorites.map((product) => (
            <div key={product.id} className={localStyles.favCard}>
              {/* Nút xóa yêu thích */}
              <button
                type="button"
                className={localStyles.removeBtn}
                onClick={() => handleRemove(product.id)}
                title="Xóa khỏi danh sách yêu thích"
              >
                ×
              </button>

              <div
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className={localStyles.imgContainer}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className={localStyles.img}
                    />
                  ) : (
                    <span className={localStyles.fallbackEmoji}>🍵</span>
                  )}
                </div>
                <div className={localStyles.infoContainer}>
                  <h4 className={localStyles.title}>
                    {product.name}
                  </h4>
                  <div className={localStyles.price}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default FavoriteList;
