import {
  ApiDataResponseOfIEnumerableOfUserPaymentMethodResponse,
  ApiDataResponseOfUserPaymentMethodResponse,
  ImpersonationResponse,
  ImpersonationStatusResponse,
  RevertImpersonationResponse,
  UserDetailedResponse,
  UserPaymentMethodRequest,
  UserPaymentMethodResponse,
} from '@/HockeyPickup.Api';
import api from '../services/api';
import { ApiError } from './error';

export const getUserById = async (userId: string | undefined): Promise<UserDetailedResponse> => {
  const response = await api.get<UserDetailedResponse>(`/Users/${userId}`);
  return response.data;
};

export const impersonateUser = async (
  targetUserId: string,
): Promise<ImpersonationResponse | null> => {
  try {
    const response = await api.post('/Impersonation/impersonate', { TargetUserId: targetUserId });
    return response.data.Data;
  } catch (error) {
    console.error('Error impersonating user:', error);
    return null;
  }
};

export const getImpersonationStatus = async (): Promise<ImpersonationStatusResponse | null> => {
  try {
    const response = await api.get('/Impersonation/status');
    return response.data.Data;
  } catch (error) {
    console.error('Error getting impersonation status:', error);
    return null;
  }
};

export const revertImpersonation = async (): Promise<RevertImpersonationResponse | null> => {
  try {
    const response = await api.post('/Impersonation/revert');
    return response.data.Data;
  } catch (error) {
    console.error('Error reverting impersonation:', error);
    return null;
  }
};

export const userPaymentService = {
  async addPaymentMethod(
    userId: string,
    request: UserPaymentMethodRequest,
  ): Promise<ApiDataResponseOfUserPaymentMethodResponse> {
    try {
      const response = await api.post<ApiDataResponseOfUserPaymentMethodResponse>(
        `/Users/${userId}/payment-methods`,
        request,
      );
      return response.data;
    } catch (error) {
      if ((error as ApiError).response?.data) {
        return (error as ApiError).response?.data as ApiDataResponseOfUserPaymentMethodResponse;
      }
      throw error;
    }
  },

  async updatePaymentMethod(
    userId: string,
    paymentMethodId: number,
    request: UserPaymentMethodRequest,
  ): Promise<ApiDataResponseOfUserPaymentMethodResponse> {
    try {
      const response = await api.put<ApiDataResponseOfUserPaymentMethodResponse>(
        `/Users/${userId}/payment-methods/${paymentMethodId}`,
        request,
      );
      return response.data;
    } catch (error) {
      if ((error as ApiError).response?.data) {
        return (error as ApiError).response?.data as ApiDataResponseOfUserPaymentMethodResponse;
      }
      throw error;
    }
  },

  async getPaymentMethods(userId: string): Promise<UserPaymentMethodResponse[]> {
    const response = await api.get<ApiDataResponseOfIEnumerableOfUserPaymentMethodResponse>(
      `/Users/${userId}/payment-methods`,
    );
    return response.data.Data ?? [];
  },

  async deletePaymentMethod(
    userId: string,
    paymentMethodId: number,
  ): Promise<ApiDataResponseOfUserPaymentMethodResponse> {
    try {
      const response = await api.delete<ApiDataResponseOfUserPaymentMethodResponse>(
        `/Users/${userId}/payment-methods/${paymentMethodId}`,
      );
      return response.data;
    } catch (error: unknown) {
      if ((error as ApiError).response?.data) {
        return (error as ApiError).response?.data as ApiDataResponseOfUserPaymentMethodResponse;
      }
      throw error;
    }
  },
};
