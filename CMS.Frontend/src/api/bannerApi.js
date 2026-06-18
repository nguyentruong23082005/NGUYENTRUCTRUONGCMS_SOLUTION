import axiosClient from './axiosClient';

export const bannerApi = {
  getAllActive: () => {
    return axiosClient.get('/api/banners');
  }
};

export default bannerApi;
