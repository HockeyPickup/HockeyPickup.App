import {
  ApiDataResponseOfSessionDetailedResponse,
  UpdateRosterPositionRequest,
} from '@/HockeyPickup.Api';
import api from '../services/api';

export const sessionService = {
  async updateRosterPosition(
    request: UpdateRosterPositionRequest,
  ): Promise<ApiDataResponseOfSessionDetailedResponse> {
    const response = await api.put<ApiDataResponseOfSessionDetailedResponse>(
      '/Session/update-roster-position',
      request,
    );
    console.info(response);
    return response.data;
  },
};