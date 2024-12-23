import { UserDetailedResponse } from '@/HockeyPickup.Api';
import api from '../services/api';

export const getUserById = async (userId: string | undefined): Promise<UserDetailedResponse> => {
  const response = await api.get<UserDetailedResponse>(`/Users/${userId}`);
  return response.data;
};
