import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axiosClient from '../../api/axiosClient';
import Loading from '../../components/common/Loading/Loading';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import styles from './AboutPage.module.css';

const stripHtmlToText = (value = '') => {
  if (!value) return '';

  const parser = new DOMParser();
  const document = parser.parseFromString(String(value), 'text/html');

  return document.body.textContent?.replace(/\s+/g, ' ').trim() || '';
};

const AboutPage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const categoryResponse = await axiosClient.get('/api/post-categories');
        const categoryItems = categoryResponse?.data?.data || [];
        const aboutRoot = categoryItems.find((category) => category.slug === 've-chung-toi');
        const aboutCategories = categoryItems.filter((category) => (
          category.parentId === aboutRoot?.id || category.parentName === aboutRoot?.name
        ));

        setCategories(aboutCategories);

        const response = await axiosClient.get('/api/posts', {
          params: {
            pageSize: 12,
            categoryId: aboutRoot?.id
          }
        });
        const items = response?.data?.data?.items || [];
        const list = Array.isArray(items)
          ? items.map((item) => ({
              id: String(item.id),
              title: item.title,
              slug: item.slug || item.id,
              summary: stripHtmlToText(item.summary || item.content || ''),
              imageUrl: item.thumbnailUrl || item.imageUrl || ''
            }))
          : [];

        setPosts(list);
      } catch (error) {
        console.error('Không tải được nội dung giới thiệu từ API:', error);
        setPosts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutContent();
  }, []);

  if (loading) return <Loading fullPage />;

  return (
    <main className={styles.page}>
      <Helmet>
        <title>Về chúng tôi - Phúc Long Coffee & Tea</title>
        <meta name="description" content="Khám phá câu chuyện thương hiệu Phúc Long Heritage." />
      </Helmet>

      <div className="container">
        <nav className={styles.breadcrumbs} aria-label="Điều hướng">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <strong>Về chúng tôi</strong>
        </nav>

        {posts.length > 0 ? (
          <div className={styles.list}>
            {posts.map((post) => (
              <article key={post.id} className={styles.item}>
                <div className={styles.imageWrapper}>
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.title} className={styles.image} />
                  ) : (
                    <div className={styles.imagePlaceholder}>PHÚC LONG</div>
                  )}
                </div>
                <div className={styles.info}>
                  <h2 className={styles.postTitle}>
                    <Link to={`/about/${post.slug}`}>{post.title}</Link>
                  </h2>
                  {post.summary && <p className={styles.summary}>{post.summary}</p>}
                  <Link to={`/about/${post.slug}`} className={styles.readMore}>Xem chi tiết</Link>
                </div>
              </article>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className={styles.categoryGrid}>
            {categories.map((category) => (
              <article key={category.id} className={styles.categoryCard}>
                <h2>{category.name}</h2>
                {category.description && <p>{category.description}</p>}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Chưa có nội dung giới thiệu" description="Backend API đang trả về danh sách rỗng." />
        )}
      </div>
    </main>
  );
};

export default AboutPage;
