import { ApiDataResponseOfObject } from '@/HockeyPickup.Api';
import api from '../services/api';

export const rebuildCalendar = async (): Promise<ApiDataResponseOfObject> => {
  const response = await api.post<ApiDataResponseOfObject>(`/Calendar/Rebuild`);
  return response.data;
};

export const getCalendarUrl = async (): Promise<ApiDataResponseOfObject> => {
  const response = await api.get<ApiDataResponseOfObject>(`/Calendar`);
  return response.data;
};
