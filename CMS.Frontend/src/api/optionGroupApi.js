import axiosClient from './axiosClient';

export const optionGroupApi = {
  getAll: () => {
    return axiosClient.get('/api/option-groups');
  }
};

export default optionGroupApi;
