import axiosClient from './axiosClient';

export const productImageApi = {
  getByProductId: (productId) => {
    return axiosClient.get(`/api/product-images/product/${productId}`);
  }
};

export default productImageApi;
