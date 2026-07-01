import { useState, useEffect } from 'react';
import reviewApi from '../api/reviewApi';

/**
 * Hook quản lý đánh giá sản phẩm từ API thật
 * @param {string|number} productId - ID sản phẩm cần lấy đánh giá
 * @returns {{ reviews: Array, loading: boolean, createReview: Function }}
 */
export const useReviews = (productId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await reviewApi.getByProductId(productId);
        if (response.data && response.data.success && response.data.data) {
          setReviews(response.data.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải đánh giá:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  const createReview = async (reviewData) => {
    const response = await reviewApi.create(reviewData);
    return response.data;
  };

  return { reviews, loading, createReview };
};

export default useReviews;
