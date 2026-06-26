import { useState, useEffect } from 'react';
import productService from '../services/productService';

/**
 * Hook quản lý dữ liệu sản phẩm từ API thật
 * @param {Object} params - Tham số truy vấn (pageSize, categorySlug, keyword...)
 * @returns {{ products: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export const useProducts = (params = {}) => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 12, totalItems: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = params.searchMode
        ? await productService.searchProducts(params)
        : await productService.getProducts(params);
      
      if (result && typeof result === 'object' && 'items' in result) {
        setProducts(result.items);
        setPagination({
          page: result.page,
          pageSize: result.pageSize,
          totalItems: result.totalItems,
          totalPages: result.totalPages
        });
      } else {
        setProducts([]);
        setPagination({ page: 1, pageSize: 12, totalItems: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm từ API:', err);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
      setProducts([]);
      setPagination({ page: 1, pageSize: 12, totalItems: 0, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return { products, pagination, loading, error, refetch: fetchProducts };
};

export default useProducts;
