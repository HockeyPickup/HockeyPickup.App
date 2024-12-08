import { UserDetailedResponse } from '../HockeyPickup.Api';
import api from './api';

export const userService = {
  async getCurrentUser(): Promise<UserDetailedResponse> {
    const response = await api.get<UserDetailedResponse>('/Users/current');
    return response.data;
  },
};
