import { ApiDataResponseOfBuySellResponse, BuyRequest, SellRequest } from '@/HockeyPickup.Api';
import api from '../services/api';

export const buySellService = {
  async buySpot(request: BuyRequest): Promise<ApiDataResponseOfBuySellResponse> {
    const response = await api.post<ApiDataResponseOfBuySellResponse>('/BuySell/buy', request);
    console.info(response);
    return response.data;
  },

  async sellSpot(request: SellRequest): Promise<ApiDataResponseOfBuySellResponse> {
    const response = await api.post<ApiDataResponseOfBuySellResponse>('/BuySell/sell', request);
    console.info(response);
    return response.data;
  },
};
