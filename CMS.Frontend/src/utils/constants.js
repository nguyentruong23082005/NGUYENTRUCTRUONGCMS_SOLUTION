/**
 * Hằng số dùng chung toàn bộ ứng dụng Frontend
 * Tập trung quản lý các giá trị cố định tại một nơi duy nhất
 */

// URL gốc API Backend (ưu tiên biến môi trường, fallback sang localhost)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7296';

// Tên key localStorage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
  CART_GUEST: 'cart_guest',
  CART_USER_PREFIX: 'cart_user_'
};

// Số sản phẩm mỗi trang (mặc định)
export const DEFAULT_PAGE_SIZE = 12;

// Trạng thái đơn hàng
export const ORDER_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPING: 'Shipping',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};

// Label trạng thái đơn hàng tiếng Việt
export const ORDER_STATUS_LABEL = {
  Pending: 'Chờ xác nhận',
  Confirmed: 'Đã xác nhận',
  Processing: 'Đang chuẩn bị',
  Shipping: 'Đang giao',
  Delivered: 'Đã giao',
  Cancelled: 'Đã huỷ'
};
