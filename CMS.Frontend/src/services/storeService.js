import storeApi from '../api/storeApi';

/**
 * Service xử lý logic nghiệp vụ cửa hàng
 * Tìm kiếm và lọc cửa hàng theo khu vực
 */

// Lấy toàn bộ danh sách cửa hàng
export const getAllStores = async () => {
  const response = await storeApi.getAll();
  if (response.data?.success && response.data?.data) {
    return response.data.data;
  }
  return [];
};

// Lọc cửa hàng theo từ khoá tìm kiếm (tên, địa chỉ)
export const filterStores = (stores, keyword) => {
  if (!keyword) return stores;
  const lowerKeyword = keyword.toLowerCase();
  return stores.filter(store =>
    (store.name && store.name.toLowerCase().includes(lowerKeyword)) ||
    (store.address && store.address.toLowerCase().includes(lowerKeyword))
  );
};

export default { getAllStores, filterStores };
