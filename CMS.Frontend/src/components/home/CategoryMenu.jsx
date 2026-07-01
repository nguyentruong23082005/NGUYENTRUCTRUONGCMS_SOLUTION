import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import categoryApi from '../../api/categoryApi';
import { logApiError } from '../../utils/apiError';
import { getFullImageUrl } from '../../utils/imageHelper';
import styles from './CategoryMenu.module.css';

// Component hiển thị danh mục sản phẩm dưới dạng thanh menu ngang với ảnh bo tròn (đáp ứng tiêu chí Mã số 38)
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

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.categoryPillsContainer}>
          <Link to="/menu" className={styles.pillItem}>
            Tất cả sản phẩm
          </Link>
          
          {categories.map((cat) => {
            const hasImage = Boolean(cat.imageUrl && !failedImages[cat.id]);
            return (
              <Link
                key={cat.id}
                to={`/menu/${cat.slug}`}
                className={styles.pillItem}
              >
                {hasImage && (
                  <img
                    src={cat.imageUrl}
                    alt=""
                    className={styles.pillImage}
                    onError={() => handleImageError(cat.id)}
                  />
                )}
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryMenu;
