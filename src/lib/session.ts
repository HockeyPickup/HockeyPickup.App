import {
  ApiDataResponseOfBoolean,
  ApiDataResponseOfSessionDetailedResponse,
  CreateSessionRequest,
  UpdateRosterPlayingStatusRequest,
  UpdateRosterPositionRequest,
  UpdateRosterTeamRequest,
  UpdateSessionRequest,
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

  async updateRosterTeam(
    request: UpdateRosterTeamRequest,
  ): Promise<ApiDataResponseOfSessionDetailedResponse> {
    const response = await api.put<ApiDataResponseOfSessionDetailedResponse>(
      '/Session/update-roster-team',
      request,
    );
    console.info(response);
    return response.data;
  },

  async updateRosterPlayingStatus(
    request: UpdateRosterPlayingStatusRequest,
  ): Promise<ApiDataResponseOfSessionDetailedResponse> {
    const response = await api.put<ApiDataResponseOfSessionDetailedResponse>(
      '/Session/update-roster-playing-status',
      request,
    );
    console.info(response);
    return response.data;
  },

  async deleteFromRoster(
    sessionId: number,
    userId: string,
  ): Promise<ApiDataResponseOfSessionDetailedResponse> {
    const response = await api.delete<ApiDataResponseOfSessionDetailedResponse>(
      `/Session/delete-roster-player/${sessionId}/${userId}`,
    );
    console.info(response);
    return response.data;
  },

  async updateSession(
    request: UpdateSessionRequest,
  ): Promise<ApiDataResponseOfSessionDetailedResponse> {
    const response = await api.put<ApiDataResponseOfSessionDetailedResponse>(
      '/Session/update-session',
      request,
    );
    console.info(response);
    return response.data;
  },

  async createSession(
    request: CreateSessionRequest,
  ): Promise<ApiDataResponseOfSessionDetailedResponse> {
    const response = await api.post<ApiDataResponseOfSessionDetailedResponse>(
      '/Session/create-session',
      request,
    );
    console.info(response);
    return response.data;
  },

  async deleteSession(sessionId: number): Promise<ApiDataResponseOfBoolean> {
    const response = await api.delete<ApiDataResponseOfBoolean>(
      `/Session/delete-session/${sessionId}`,
    );
    console.info(response);
    return response.data;
  },
};
