import api from './config';

export interface CreateWithdrawalRequest {
  amount: number;
  recipient: string;
}

export const withdrawalsService = {
  createWithdrawal: async (userId: string, data: CreateWithdrawalRequest) => {
    const response = await api.post(`/withdrawals/create/${userId}/withdrawal`, data);
    return response.data;
  },
};

export default withdrawalsService; 
