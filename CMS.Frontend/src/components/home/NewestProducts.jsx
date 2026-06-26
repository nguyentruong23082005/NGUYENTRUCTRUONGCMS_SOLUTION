import React, { useState, useEffect } from 'react';
import ProductCard from '../product/ProductCard';
import { getNewestProducts } from '../../services/productService';
import styles from './NewestProducts.module.css';

const NewestProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewest = async () => {
      try {
        const data = await getNewestProducts(3);
        setProducts(data);
      } catch (error) {
        console.error('Lỗi tải sản phẩm mới nhất:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNewest();
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.icon}>🆕</span>
            SẢN PHẨM MỚI NHẤT
          </h2>
          <p className={styles.subtitle}>Vừa ra mắt tại Phúc Long Heritage</p>
        </div>

        <div className={styles.grid}>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.skeleton}>
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonText} />
                  <div className={styles.skeletonPrice} />
                </div>
              ))
            : products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{ ...product, badgeLabel: '🆕 Mới' }}
                />
              ))}
        </div>
      </div>
    </section>
  );
};

export default NewestProducts;
