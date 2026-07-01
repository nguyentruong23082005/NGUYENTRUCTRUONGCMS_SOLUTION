import axiosClient from './axiosClient';

// API quản lý danh mục sản phẩm
export const categoryApi = {
  getTree: () => {
    return axiosClient.get('/api/product-categories/tree');
  }
};

export default categoryApi;
