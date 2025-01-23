import { ApiDataResponseOfTransactionResponse, BuyRequest, SellRequest } from '@/HockeyPickup.Api';
import api from '../services/api';

export const transactionService = {
  async buySpot(request: BuyRequest): Promise<ApiDataResponseOfTransactionResponse> {
    const response = await api.post<ApiDataResponseOfTransactionResponse>(
      '/Transaction/buy',
      request,
    );
    console.info(response);
    return response.data;
  },

  async sellSpot(request: SellRequest): Promise<ApiDataResponseOfTransactionResponse> {
    const response = await api.post<ApiDataResponseOfTransactionResponse>(
      '/Transaction/sell',
      request,
    );
    console.info(response);
    return response.data;
  },
};
