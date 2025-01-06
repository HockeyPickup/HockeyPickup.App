import { ApiDataResponseOfString } from '@/HockeyPickup.Api';
import api from '../services/api';

export const rebuildCalendar = async (): Promise<ApiDataResponseOfString> => {
  const response = await api.post<ApiDataResponseOfString>(`/Calendar/Rebuild`);
  return response.data;
};

export const getCalendarUrl = async (): Promise<ApiDataResponseOfString> => {
  const response = await api.get<ApiDataResponseOfString>(`/Calendar`);
  return response.data;
};
