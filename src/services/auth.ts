import { useEffect } from 'react';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UserBasicResponse } from '../HockeyPickup.Api';
import api from './api';
import { userService } from './user';

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/Auth/login', data);
      console.log('Login response:', response);
      
      if (response.data.Token) {
        localStorage.setItem('auth_token', response.data.Token);
        return response.data;
      } else {
        throw new Error('No token received in login response');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Re-throw the error so the component can handle it
      throw error;
    }
  },
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/Auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/Auth/logout');
    localStorage.removeItem('auth_token');
  },
};

export const useAuth = (setUser: (user: UserBasicResponse) => void) => {
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      userService.getCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('auth_token');
        });
    }
  }, [setUser]);
}