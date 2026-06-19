import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../pages/Profile/Profile.module.css';

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
        <div className={styles.emptyState} style={{ padding: '48px 0', textAlign: 'center' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>❤️</span>
          <p style={{ fontSize: 15, color: '#666666', marginBottom: 20 }}>Bạn chưa thích sản phẩm nào.</p>
          <button 
            type="button" 
            className={styles.btnPrimary}
            onClick={() => navigate('/menu')}
          >
            Khám phá thực đơn ngay
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {favorites.map((product) => (
            <div 
              key={product.id} 
              style={{
                border: '1px solid #ECEFF1',
                borderRadius: 8,
                overflow: 'hidden',
                background: '#FFFFFF',
                position: 'relative'
              }}
            >
              {/* Nút xóa yêu thích */}
              <button
                type="button"
                onClick={() => handleRemove(product.id)}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 16,
                  color: '#B71C1C',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  zIndex: 2
                }}
                title="Xóa khỏi danh sách yêu thích"
              >
                ×
              </button>

              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div style={{ height: 160, background: '#ECEFF1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <span style={{ fontSize: 40 }}>🍵</span>
                  )}
                </div>
                <div style={{ padding: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#333333', marginBottom: 8, height: 40, overflow: 'hidden' }}>
                    {product.name}
                  </h4>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#006F3C' }}>
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
