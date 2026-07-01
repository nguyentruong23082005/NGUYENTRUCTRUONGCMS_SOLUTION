import axiosClient from './axiosClient';

export const reviewApi = {
  getByProductId: (productId) => {
    return axiosClient.get(`/api/reviews/product/${productId}`);
  },
  create: (reviewData) => {
    return axiosClient.post('/api/reviews', reviewData);
  }
};

export default reviewApi;
