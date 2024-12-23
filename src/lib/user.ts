import {
  ImpersonationResponse,
  ImpersonationStatusResponse,
  RevertImpersonationResponse,
  UserDetailedResponse,
} from '@/HockeyPickup.Api';
import api from '../services/api';

export const getUserById = async (userId: string | undefined): Promise<UserDetailedResponse> => {
  const response = await api.get<UserDetailedResponse>(`/Users/${userId}`);
  return response.data;
};

export const impersonateUser = async (
  targetUserId: string,
): Promise<ImpersonationResponse | null> => {
  try {
    const response = await api.post('/Impersonation/impersonate', { TargetUserId: targetUserId });
    return response.data.Data;
  } catch (error) {
    console.error('Error impersonating user:', error);
    return null;
  }
};

export const getImpersonationStatus = async (): Promise<ImpersonationStatusResponse | null> => {
  try {
    const response = await api.get('/Impersonation/status');
    return response.data.Data;
  } catch (error) {
    console.error('Error getting impersonation status:', error);
    return null;
  }
};

export const revertImpersonation = async (): Promise<RevertImpersonationResponse | null> => {
  try {
    const response = await api.post('/Impersonation/revert');
    return response.data.Data;
  } catch (error) {
    console.error('Error reverting impersonation:', error);
    return null;
  }
};
