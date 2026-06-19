import React from 'react';
import useProducts from '../../hooks/useProducts';
import HeroBanner from '../../components/home/HeroBanner';
import ProductCard from '../../components/product/ProductCard';
import ProductCardSkeleton from '../../components/product/ProductCardSkeleton';
import PostGrid from '../../components/home/PostGrid';
import StoreLocator from '../../components/store/StoreLocator';
import styles from './Home.module.css';

const Home = () => {
  const { products, loading, error: errorMessage } = useProducts({ pageSize: 5 });

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
