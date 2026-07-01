/**
 * Định dạng ngày giờ theo chuẩn Việt Nam
 * @param {string|Date} dateStr - Ngày cần định dạng
 * @param {Object} options - Tuỳ chọn hiển thị
 * @returns {string} Chuỗi ngày đã định dạng (ví dụ: "12/06/2026")
 */
export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options
  };

  return new Intl.DateTimeFormat('vi-VN', defaultOptions).format(date);
};

/**
 * Định dạng ngày giờ đầy đủ (bao gồm giờ phút)
 */
export const formatDateTime = (dateStr) => {
  return formatDate(dateStr, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default formatDate;
