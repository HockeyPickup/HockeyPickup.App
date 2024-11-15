import { UserBasicResponse } from '../HockeyPickup.Api';
import api from './api';

export const userService = {
  async getCurrentUser(): Promise<UserBasicResponse> {
    const response = await api.get<UserBasicResponse>('/User/current');
    return response.data;
  },
};