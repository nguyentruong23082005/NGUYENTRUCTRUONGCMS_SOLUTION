/**
 * Helper xử lý đường dẫn ảnh từ API
 * Tự động ghép nối với VITE_API_URL từ biến môi trường mà không có fallback hardcode
 */
export const getFullImageUrl = (path) => {
  if (!path) return '';
  
  // Nếu là link tuyệt đối hoặc data URI, trả về luôn
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export default getFullImageUrl;
