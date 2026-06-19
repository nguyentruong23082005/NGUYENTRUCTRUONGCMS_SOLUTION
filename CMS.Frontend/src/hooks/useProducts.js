import { useState, useEffect } from 'react';
import productService from '../services/productService';

/**
 * Hook quản lý dữ liệu sản phẩm từ API thật
 * @param {Object} params - Tham số truy vấn (pageSize, categorySlug, keyword...)
 * @returns {{ products: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export const useProducts = (params = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await productService.getProducts(params);
      setProducts(list);
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm từ API:', err);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return { products, loading, error, refetch: fetchProducts };
};

export default useProducts;
