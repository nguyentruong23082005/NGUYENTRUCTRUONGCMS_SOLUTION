import axiosClient from './axiosClient';

// API quản lý mã giảm giá voucher
export const voucherApi = {
  getByCode: (code) => {
    return axiosClient.get(`/api/vouchers/${code}`);
  }
};

export default voucherApi;
