import api from '../services/api';

export const getUserById = async (userId: string | undefined): Promise<any> => {
  const response = await api.get<any>(`/api/users/${userId}`);
  return response.data;
};
