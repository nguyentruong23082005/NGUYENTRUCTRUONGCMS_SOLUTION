/**
 * Tiện ích thao tác với localStorage an toàn
 * Xử lý lỗi JSON.parse/stringify và trả giá trị mặc định khi lỗi
 */

// Lấy dữ liệu từ localStorage (tự động parse JSON)
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Lỗi khi đọc localStorage key "${key}":`, error);
    return defaultValue;
  }
};

// Lưu dữ liệu vào localStorage (tự động stringify)
export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Lỗi khi ghi localStorage key "${key}":`, error);
  }
};

// Xoá một key khỏi localStorage
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Lỗi khi xoá localStorage key "${key}":`, error);
  }
};

// Xoá toàn bộ localStorage (dùng khi logout hoặc reset)
export const clearAll = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Lỗi khi xoá toàn bộ localStorage:', error);
  }
};

export default { getItem, setItem, removeItem, clearAll };
