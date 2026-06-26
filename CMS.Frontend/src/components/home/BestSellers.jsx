import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../product/ProductCard';
import { getBestSellers } from '../../services/productService';
import styles from './BestSellers.module.css';

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        // Fetch 5 bestseller products to show in a single row
        const data = await getBestSellers(5);
        setProducts(data);
      } catch (error) {
        console.error('Lỗi tải sản phẩm bán chạy:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>BEST SELLERS</h2>
          </div>
          <div className={styles.grid}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.skeleton}>
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonText} />
                <div className={styles.skeletonPrice} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  const categoryName = products[0].productCategoryName;
  const categorySlug = products[0].categorySlug;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>BEST SELLERS - {categoryName.toUpperCase()}</h2>
        </div>

        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{ ...product }}
            />
          ))}
        </div>

        <div className={styles.moreActions}>
          <Link to={`/menu/${categorySlug}`} className={styles.moreButton}>
            Xem thêm 3 sản phẩm <strong>BEST SELLERS - {categoryName.toUpperCase()}</strong> <span style={{ fontSize: '10px', marginLeft: '4px' }}>▼</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
