import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axiosClient from '../../api/axiosClient';
import Loading from '../../components/common/Loading/Loading';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import styles from './AboutDetailPage.module.css';

// Trang hiển thị nội dung chi tiết bài giới thiệu (Mã số 27 & 44: render HTML CKEditor bằng dangerouslySetInnerHTML)
// Đã xóa hoàn toàn dữ liệu giả lập (mock data), chỉ dùng dữ liệu thực tế từ database
const AboutDetailPage = () => {
  const { postSlug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostDetail = async () => {
      setLoading(true);
      try {
        // Gọi API Backend lấy chi tiết bài viết theo Slug thân thiện SEO
        const response = await axiosClient.get(`/api/posts/by-slug/${postSlug}`);
        
        // ApiResponse có cấu trúc: { success: true, data: PostDetailDto }
        if (response.data && response.data.success && response.data.data) {
          const item = response.data.data;
          setPost({
            id: item.id.toString(),
            title: item.title,
            slug: item.slug,
            imageUrl: item.thumbnailUrl || '',
            createdAt: new Date(item.createdAt).toLocaleDateString('vi-VN'),
            content: item.content || '<p>Bài viết chưa cập nhật nội dung.</p>'
          });
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error(`Lỗi khi tải chi tiết bài viết ${postSlug} từ API thật:`, error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetail();
  }, [postSlug]);

  if (loading) return <Loading fullPage />;
  if (!post) return <EmptyState title="Không tìm thấy bài viết" description="Bài viết bạn đang truy cập không tồn tại hoặc đã bị xóa trong database." />;

  return (
    <article className={styles.page}>
      <Helmet>
        <title>{post.title} - Phúc Long Coffee & Tea</title>
        <meta name="description" content={post.title} />
      </Helmet>

      <div className="container">
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbs}>
          <Link to="/">Trang chủ</Link> <span>/</span> <Link to="/about">Giới thiệu</Link> <span>/</span> <strong>{post.title}</strong>
        </div>

        <div className={styles.wrapper}>
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.meta}>Đăng ngày: {post.createdAt}</div>

          {post.imageUrl && (
            <div className={styles.imageContainer}>
              <img src={post.imageUrl} alt={post.title} className={styles.image} />
            </div>
          )}

          {/* Render HTML trọn vẹn từ CKEditor của Admin Backend (Mã số 27 & 44) */}
          <div 
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className={styles.backBtnWrapper}>
            <Link to="/about" className={styles.backBtn}>
              &larr; Quay lại danh sách câu chuyện
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default AboutDetailPage;
