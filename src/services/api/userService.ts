import api from './config';

export const userService = {
  isInitialized: async (userId: string) => {
    const response = await api.get(`/user/${userId}/initialized`);
    return response.data;
  },


  getAddress: async (userId: string) => {
    const response = await api.get(`/user/${userId}/address`);
    return response.data;
  },
};

export default userService; 
