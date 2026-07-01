import { IMAGE_BASE_URL } from './constants';

/**
 * Helper xử lý đường dẫn ảnh từ API
 * Tự động ghép nối với IMAGE_BASE_URL từ hằng số cấu hình hệ thống
 */
export const getFullImageUrl = (path) => {
  if (!path) return '';
  
  // Nếu là link tuyệt đối hoặc data URI, trả về luôn
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${IMAGE_BASE_URL}${cleanPath}`;
};

export default getFullImageUrl;
