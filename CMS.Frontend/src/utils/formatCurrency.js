/**
 * Định dạng số tiền theo chuẩn VND Việt Nam
 * @param {number} price - Giá trị tiền cần định dạng
 * @returns {string} Chuỗi tiền định dạng (ví dụ: "60.000 ₫")
 */
export const formatCurrency = (price) => {
  if (price === null || price === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

export default formatCurrency;
