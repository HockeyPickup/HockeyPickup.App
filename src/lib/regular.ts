import {
  AddRegularRequest,
  ApiDataResponseOfRegularSetDetailedResponse,
  ApiResponse,
  DuplicateRegularSetRequest,
  UpdateRegularPositionRequest,
  UpdateRegularSetRequest,
  UpdateRegularTeamRequest,
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

  async updateRegularSet(
    regularSetId: number,
    description: string,
    dayOfWeek: number,
    archived: boolean,
  ): Promise<ApiDataResponseOfRegularSetDetailedResponse> {
    const request: UpdateRegularSetRequest = {
      RegularSetId: regularSetId,
      Description: description,
      DayOfWeek: dayOfWeek,
      Archived: archived,
    };

    const response = await api.put<ApiDataResponseOfRegularSetDetailedResponse>(
      '/Regular/update-regular-set',
      request,
    );
    return response.data;
  },

  async updateRegularPosition(
    request: UpdateRegularPositionRequest,
  ): Promise<ApiDataResponseOfRegularSetDetailedResponse> {
    const response = await api.put<ApiDataResponseOfRegularSetDetailedResponse>(
      '/Regular/update-regular-position',
      request,
    );
    console.info(response);
    return response.data;
  },

  async updateRegularTeam(
    request: UpdateRegularTeamRequest,
  ): Promise<ApiDataResponseOfRegularSetDetailedResponse> {
    const response = await api.put<ApiDataResponseOfRegularSetDetailedResponse>(
      '/Regular/update-regular-team',
      request,
    );
    console.info(response);
    return response.data;
  },

  async deleteRegularSet(regularSetId: number): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/Regular/delete-regular-set/${regularSetId}`);
    console.info(response);
    return response.data;
  },

  async addRegular(
    request: AddRegularRequest,
  ): Promise<ApiDataResponseOfRegularSetDetailedResponse> {
    const response = await api.post<ApiDataResponseOfRegularSetDetailedResponse>(
      '/Regular/add-regular',
      request,
    );
    console.info(response);
    return response.data;
  },

  async deleteRegular(
    regularSetId: number,
    userId: string,
  ): Promise<ApiDataResponseOfRegularSetDetailedResponse> {
    const response = await api.delete<ApiDataResponseOfRegularSetDetailedResponse>(
      `/Regular/delete-regular/${regularSetId}/${userId}`,
    );
    return response.data;
  },
};
