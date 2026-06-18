import React, { useEffect, useState } from 'react';
import productApi from '../../api/productApi';
import HeroBanner from '../../components/home/HeroBanner';
import ProductCard from '../../components/product/ProductCard';
import ProductCardSkeleton from '../../components/product/ProductCardSkeleton';
import PostGrid from '../../components/home/PostGrid';
import StoreLocator from '../../components/store/StoreLocator';
import { getApiErrorMessage, logApiError } from '../../utils/apiError';
import styles from './Home.module.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productApi.getAll({ pageSize: 5 });
        const items = response?.data?.data?.items || response?.data?.data || [];

        const formattedProducts = Array.isArray(items)
          ? items.map((item) => ({
              id: String(item.id),
              name: item.name,
              price: item.price || item.unitPrice || 0,
              stockQuantity: item.stockQuantity ?? item.unitsInStock ?? 0,
              imageUrl: item.imageUrl || item.thumbnailUrl || item.image || '',
              description: item.description,
              isBestSeller: Boolean(item.isBestSeller || item.isFeatured || item.isHot),
            }))
          : [];

        setProducts(formattedProducts);
        setErrorMessage('');
      } catch (error) {
        logApiError('Không tải được sản phẩm trang chủ', error);
        setProducts([]);
        setErrorMessage(getApiErrorMessage(error, 'Không thể tải sản phẩm từ hệ thống.'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className={styles.home}>
      <HeroBanner />

      <section className={styles.productSection}>
        <div className={styles.productInner}>
          <div className={styles.sectionHeader}>
            <h1 className={styles.title}>SẢN PHẨM NỔI BẬT</h1>
          </div>

          {loading ? (
            <div className={styles.grid}>
              {Array.from({ length: 5 }).map((_, index) => <ProductCardSkeleton key={index} />)}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className={styles.grid}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className={styles.moreActions}>
                <a href="/menu" className={styles.moreButton}>Xem thêm sản phẩm</a>
              </div>
            </>
          ) : (
            <div className={styles.emptyState} role="status">
              <strong>Chưa có dữ liệu sản phẩm từ hệ thống.</strong>
              <span>{errorMessage || 'Backend API đang trả về danh sách rỗng.'}</span>
            </div>
          )}
        </div>
      </section>

      <PostGrid />
      <StoreLocator />
    </div>
  );
};

export default Home;
