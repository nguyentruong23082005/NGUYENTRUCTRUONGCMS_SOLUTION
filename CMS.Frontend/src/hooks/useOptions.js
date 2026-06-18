import { useState, useEffect } from 'react';
import optionGroupApi from '../api/optionGroupApi';

/**
 * Hook quản lý nhóm tuỳ chọn (size, topping...) từ API thật
 * @returns {{ optionGroups: Array, loading: boolean, error: string|null }}
 */
export const useOptions = () => {
  const [optionGroups, setOptionGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await optionGroupApi.getAll();
        if (response.data && response.data.success && response.data.data) {
          setOptionGroups(response.data.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải nhóm tuỳ chọn:', err);
        setError('Không thể tải tuỳ chọn sản phẩm.');
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  return { optionGroups, loading, error };
};

export default useOptions;
