import {
  ApiDataResponseOfRegularSetDetailedResponse,
  DuplicateRegularSetRequest,
} from '@/HockeyPickup.Api';
import api from '../services/api';

export const regularService = {
  async duplicateRegularSet(
    regularSetId: number,
    description: string,
  ): Promise<ApiDataResponseOfRegularSetDetailedResponse> {
    const request: DuplicateRegularSetRequest = {
      RegularSetId: regularSetId,
      Description: description,
    };

    const response = await api.post<ApiDataResponseOfRegularSetDetailedResponse>(
      '/Regular/duplicate-regular-set',
      request,
    );
    console.info(response);
    return response.data;
  },
};
