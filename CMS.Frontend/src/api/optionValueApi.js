import axiosClient from './axiosClient';

export const optionValueApi = {
  getAll: () => {
    return axiosClient.get('/api/option-values');
  }
};

export default optionValueApi;
