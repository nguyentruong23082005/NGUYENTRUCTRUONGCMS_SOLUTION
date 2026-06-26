import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import categoryApi from '../../api/categoryApi';
import { logApiError } from '../../utils/apiError';
import styles from './CategoryMenu.module.css';

const getFullImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5188';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Component hiển thị danh mục sản phẩm dưới dạng các khối tròn chứa hình ảnh (đáp ứng tiêu chí Mã số 38)
// Đã loại bỏ hoàn toàn dữ liệu ảo (mock data), chỉ sử dụng dữ liệu thực tế tải từ Backend API
const CategoryMenu = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState({});

  const handleImageError = (id) => {
    setFailedImages(prev => ({ ...prev, [id]: true }));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Lấy cây danh mục sản phẩm từ API Backend thật qua categoryApi
        const response = await categoryApi.getTree();

        // Cấu trúc ApiResponse: { success: true, data: [...] }
        if (response.data && response.data.success && response.data.data) {
          const formatted = response.data.data.map(item => ({
            id: item.id.toString(),
            name: item.name,
            slug: item.slug,
            imageUrl: item.imageUrl ? getFullImageUrl(item.imageUrl) : ''
          }));
          setCategories(formatted);
        }
      } catch (error) {
        logApiError('Không tải được danh mục sản phẩm', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return null;
  }

  if (categories.length === 0) {
    return null;
  }

  // Xác định emoji dựa trên tên danh mục
  const getCategoryEmoji = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('bánh') || lower.includes('cake')) return '🍰';
    if (lower.includes('trà') || lower.includes('tea')) return '🍵';
    return '☕';
  };

  return (
    <section className={styles.section}>
      <div className="container">
        <h3 className={styles.sectionTitle}>Danh Mục Sản Phẩm</h3>
        <div className={styles.grid}>
          {categories.map((cat) => {
            const hasImage = Boolean(cat.imageUrl && !failedImages[cat.id]);

            return (
              <Link
                key={cat.id}
                to={`/menu/${cat.slug}`}
                className={styles.item}
              >
                <div className={styles.imageContainer}>
                  {hasImage ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className={styles.image}
                      loading="lazy"
                      onError={() => handleImageError(cat.id)}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      {getCategoryEmoji(cat.name)}
                    </div>
                  )}
                </div>
                <span className={styles.name}>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryMenu;
