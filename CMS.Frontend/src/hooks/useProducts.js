import { useState, useEffect } from 'react';
import productApi from '../api/productApi';

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
      const response = await productApi.getAll(params);
      if (response.data && response.data.success && response.data.data && response.data.data.items) {
        const list = response.data.data.items.map(item => ({
          id: item.id.toString(),
          name: item.name,
          price: item.price || item.unitPrice,
          stockQuantity: item.stockQuantity ?? item.unitsInStock ?? 0,
          imageUrl: item.imageUrl || '',
          description: item.description || '',
          categorySlug: item.categorySlug || ''
        }));
        setProducts(list);
      } else {
        setProducts([]);
      }
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
