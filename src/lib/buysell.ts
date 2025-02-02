import {
  ApiDataResponseOfBoolean,
  ApiDataResponseOfBuySellResponse,
  ApiDataResponseOfBuySellStatusResponse,
  BuyRequest,
  PaymentMethodType,
  SellRequest,
} from '@/HockeyPickup.Api';
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

  async cancelSell(buySellId: number): Promise<ApiDataResponseOfBoolean> {
    const response = await api.delete<ApiDataResponseOfBoolean>(
      `/BuySell/${buySellId}/cancel-sell`,
    );
    console.info(response);
    return response.data;
  },

  async cancelBuy(buySellId: number): Promise<ApiDataResponseOfBoolean> {
    const response = await api.delete<ApiDataResponseOfBoolean>(`/BuySell/${buySellId}/cancel-buy`);
    console.info(response);
    return response.data;
  },

  async confirmPaymentSent(
    buySellId: number,
    paymentMethodType: PaymentMethodType,
  ): Promise<ApiDataResponseOfBuySellResponse> {
    const response = await api.put<ApiDataResponseOfBuySellResponse>(
      `/BuySell/${buySellId}/confirm-payment-sent?paymentMethodType=${paymentMethodType}`,
    );
    console.info(response);
    return response.data;
  },

  async confirmPaymentReceived(buySellId: number): Promise<ApiDataResponseOfBuySellResponse> {
    const response = await api.put<ApiDataResponseOfBuySellResponse>(
      `/BuySell/${buySellId}/confirm-payment-received`,
    );
    console.info(response);
    return response.data;
  },

  async unConfirmPaymentSent(buySellId: number): Promise<ApiDataResponseOfBuySellResponse> {
    const response = await api.put<ApiDataResponseOfBuySellResponse>(
      `/BuySell/${buySellId}/unconfirm-payment-sent`,
    );
    console.info(response);
    return response.data;
  },

  async unConfirmPaymentReceived(buySellId: number): Promise<ApiDataResponseOfBuySellResponse> {
    const response = await api.put<ApiDataResponseOfBuySellResponse>(
      `/BuySell/${buySellId}/unconfirm-payment-received`,
    );
    console.info(response);
    return response.data;
  },

  async canBuy(sessionId: number): Promise<ApiDataResponseOfBuySellStatusResponse> {
    const response = await api.get<ApiDataResponseOfBuySellStatusResponse>(
      `/BuySell/${sessionId}/can-buy`,
    );
    console.info(response);
    return response.data;
  },

  async canSell(sessionId: number): Promise<ApiDataResponseOfBuySellStatusResponse> {
    const response = await api.get<ApiDataResponseOfBuySellStatusResponse>(
      `/BuySell/${sessionId}/can-sell`,
    );
    console.info(response);
    return response.data;
  },
};
