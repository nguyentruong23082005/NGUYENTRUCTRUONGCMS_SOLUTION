import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { getApiErrorMessage, logApiError } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import styles from './PostGrid.module.css';

const stripHtmlToText = (value = '') => {
  if (!value) return '';

  const parser = new DOMParser();
  const document = parser.parseFromString(String(value), 'text/html');

  return document.body.textContent?.replace(/\s+/g, ' ').trim() || '';
};

const PostGrid = ({
  title = 'Tin tức & Khuyến mãi',
  subtitle = 'Tin tức & Khuyến mãi của Phúc Long',
  pageSize = 8,
  variant = 'home',
  showSummary = true,
  showReadMore = true
}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const isListing = variant === 'listing';

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      try {
        const response = await axiosClient.get('/api/posts', { params: { pageSize } });
        const items = response?.data?.data?.items || response?.data?.data || [];
        const formatted = Array.isArray(items)
          ? items.slice(0, pageSize).map((item) => ({
              id: String(item.id),
              title: item.title,
              slug: item.slug || item.id,
              summary: stripHtmlToText(item.summary || item.shortDescription || item.content || ''),
              imageUrl: item.thumbnailUrl || item.imageUrl || '',
              createdAt: formatDate(item.createdAt),
              views: item.viewerNo || item.viewCount || item.views || 0,
            }))
          : [];

        setPosts(formatted);
        setErrorMessage('');
      } catch (error) {
        logApiError('Không tải được tin tức trang chủ', error);
        setPosts([]);
        setErrorMessage(getApiErrorMessage(error, 'Không thể tải tin tức từ hệ thống.'));
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [pageSize]);

  return (
    <section className={`${styles.section} ${isListing ? styles.listingSection : ''}`}>
      <div className="container">
        {title && <h2 className={styles.sectionTitle}>{title}</h2>}
        {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}

        {loading ? (
          <div className={styles.emptyState}>Đang tải tin tức từ hệ thống...</div>
        ) : posts.length > 0 ? (
          <div className={`${styles.grid} ${isListing ? styles.listingGrid : ''}`}>
            {posts.map((post) => (
              <article key={post.id} className={`${styles.card} ${isListing ? styles.listingCard : ''}`}>
                <div className={styles.imageWrapper}>
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.title} className={styles.image} loading="lazy" />
                  ) : (
                    <div className={styles.imagePlaceholder}>TIN TỨC</div>
                  )}
                </div>
                <div className={styles.content}>
                  <div className={styles.meta}>
                    {post.createdAt && <span className={styles.date}>{post.createdAt}</span>}
                    {Boolean(post.views) && <span className={styles.views}>{post.views}</span>}
                  </div>
                  <h3 className={styles.title}>
                    <Link to={`/about/${post.slug}`}>{post.title}</Link>
                  </h3>
                  {showSummary && post.summary && <p className={styles.summary}>{post.summary}</p>}
                  {showReadMore && <Link to={`/about/${post.slug}`} className={styles.readMore}>Xem chi tiết</Link>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState} role="status">
            <strong>Chưa có tin tức/khuyến mãi từ hệ thống.</strong>
            <span>{errorMessage || 'Backend API đang trả về danh sách rỗng.'}</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default PostGrid;
