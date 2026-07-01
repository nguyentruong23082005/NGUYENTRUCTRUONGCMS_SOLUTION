import axiosClient from './axiosClient';

// API quản lý mã giảm giá voucher
export const voucherApi = {
  // Lấy danh sách tất cả voucher khả dụng: GET /api/Vouchers
  getAll: () => {
    return axiosClient.get('/api/Vouchers');
  },
  // Kiểm tra tính hợp lệ của voucher: GET /api/Vouchers/validate?code=...&orderSubtotal=...
  validate: (code, orderSubtotal = 0) => {
    return axiosClient.get('/api/Vouchers/validate', { params: { code, orderSubtotal } });
  }
};

export default voucherApi;
