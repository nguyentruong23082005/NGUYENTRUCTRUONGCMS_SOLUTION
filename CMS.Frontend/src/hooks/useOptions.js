import { useState, useEffect } from 'react';
import optionGroupApi from '../api/optionGroupApi';
import optionValueApi from '../api/optionValueApi';

/**
 * Hook quản lý nhóm tuỳ chọn (size, topping...) từ API thật
 * @returns {{ optionGroups: Array, optionValues: Array, loading: boolean, error: string|null }}
 */
export const useOptions = () => {
  const [optionGroups, setOptionGroups] = useState([]);
  const [optionValues, setOptionValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [groupRes, valueRes] = await Promise.all([
          optionGroupApi.getAll(),
          optionValueApi.getAll()
        ]);
        if (groupRes.data && groupRes.data.success && groupRes.data.data) {
          setOptionGroups(groupRes.data.data);
        }
        if (valueRes.data && valueRes.data.success && valueRes.data.data) {
          setOptionValues(valueRes.data.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải nhóm tuỳ chọn và giá trị:', err);
        setError('Không thể tải tuỳ chọn sản phẩm.');
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  return { optionGroups, optionValues, loading, error };
};

export default useOptions;
