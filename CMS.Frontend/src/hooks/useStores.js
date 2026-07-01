import { useState, useEffect } from 'react';
import storeService from '../services/storeService';

/**
 * Hook quản lý dữ liệu cửa hàng từ API thật
 * @returns {{ stores: Array, loading: boolean, error: string|null }}
 */
export const useStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await storeService.getAllStores();
        setStores(data);
      } catch (err) {
        console.error('Lỗi khi tải cửa hàng từ API:', err);
        setError('Không thể tải danh sách cửa hàng.');
        setStores([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  return { stores, loading, error };
};

export default useStores;
