/**
 * Các hàm kiểm tra tính hợp lệ dữ liệu đầu vào
 * Sử dụng tại các form đăng nhập, đăng ký, thanh toán
 */

// Kiểm tra email hợp lệ
export const isValidEmail = (email) => {
  if (!email) return false;

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[a-z0-9._%+-]+@(?:[a-z0-9-]+\.)+[a-z]{2,}$/;
  const blockedTypoDomains = new Set([
    'gmai.co',
    'gmail.co',
    'gmal.com',
    'gmial.com',
    'gmai.com',
    'yaho.com',
    'yahoo.co',
    'hotmai.com',
    'hotmial.com',
    'outlok.com',
    'outlook.co'
  ]);
  const domain = normalizedEmail.split('@')[1];

  return emailRegex.test(normalizedEmail) && !blockedTypoDomains.has(domain);
};

// Kiểm tra số điện thoại Việt Nam (10-11 chữ số)
export const isValidPhone = (phone) => {
  if (!phone) return false;
  return /^[0-9]{10,11}$/.test(phone.trim());
};

// Kiểm tra mật khẩu đủ mạnh (tối thiểu 6 ký tự)
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Kiểm tra chuỗi không rỗng
export const isNotEmpty = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

// Validate form checkout
export const validateCheckoutForm = (data) => {
  const errors = {};

  if (!isNotEmpty(data.fullName)) {
    errors.fullName = 'Họ tên không được để trống';
  }
  if (!isNotEmpty(data.phone)) {
    errors.phone = 'Số điện thoại không được để trống';
  } else if (!isValidPhone(data.phone)) {
    errors.phone = 'Số điện thoại không hợp lệ (yêu cầu 10-11 chữ số)';
  }
  if (!isNotEmpty(data.address)) {
    errors.address = 'Địa chỉ nhận hàng không được để trống';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
