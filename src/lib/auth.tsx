import { createContext, FC, JSX, ReactNode, useContext, useEffect, useState } from 'react';
import {
  ApiDataResponse1,
  ApiDataResponseOfAspNetUser,
  ApiDataResponseOfLoginResponse,
  ApiResponse,
  ChangePasswordRequest,
  ConfirmEmailRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  SaveUserRequest,
  UserDetailedResponse,
} from '../HockeyPickup.Api';
import api from '../services/api';
import { userService } from '../services/user';

const userHelpers = {
  isAdmin: (user: UserDetailedResponse | null): boolean => {
    return user?.Roles?.includes('Admin') ?? false;
  },
  isSubAdmin: (user: UserDetailedResponse | null): boolean => {
    return user?.Roles?.includes('SubAdmin') ?? false;
  },
  canViewRatings: (user: UserDetailedResponse | null): boolean => {
    return user?.Roles?.includes('Admin') ?? user?.Roles?.includes('SubAdmin') ?? false;
  },
  isInRole: (user: UserDetailedResponse | null, role: string): boolean => {
    return user?.Roles?.includes(role) ?? false;
  },
};

// Auth Service Functions
const authService = {
  async login(data: LoginRequest): Promise<ApiDataResponseOfLoginResponse> {
    try {
      const response = await api.post<ApiDataResponseOfLoginResponse>('/Auth/login', data);
      if (response.data.Data?.Token) {
        localStorage.setItem('auth_token', response.data.Data?.Token);
        return response.data;
      } else {
        throw new Error('No token received in login response');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    await api.post('/Auth/logout');
    localStorage.removeItem('auth_token');
  },

  async register(data: RegisterRequest): Promise<ApiDataResponseOfAspNetUser> {
    const response = await api.post<ApiDataResponseOfAspNetUser>('/Auth/register', data);
    return response.data;
  },

  async forgotPassword(email: string): Promise<ApiDataResponse1> {
    const data: ForgotPasswordRequest = { Email: email, FrontendUrl: window.location.origin };
    const response = await api.post('/Auth/forgot-password', data);
    return response.data;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    const response = await api.post('/Auth/reset-password', data);
    console.debug('Password reset response:', response);
    return response.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    const response = await api.post('/Auth/change-password', data);
    console.debug('Password change response:', response);
    return response.data;
  },

  async saveUser(data: SaveUserRequest): Promise<ApiResponse> {
    const response = await api.post('/Auth/save-user', data);
    console.debug('Save user response:', response);
    return response.data;
  },

  async confirmEmail(data: ConfirmEmailRequest): Promise<ApiResponse> {
    const response = await api.post('/Auth/confirm-email', data);
    console.debug('Confirm email response:', response);
    return response.data;
  },
};

// Auth Context and Provider
interface AuthContextType {
  user: UserDetailedResponse | null;
  setUser: (_user: UserDetailedResponse | null) => void;
  isLoading: boolean;
  isAdmin: () => boolean;
  isSubAdmin: () => boolean;
  canViewRatings: () => boolean;
  isInRole: (_role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }): JSX.Element => {
  const [user, setUser] = useState<UserDetailedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const currentUser = await userService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to restore auth state:', error);
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        isAdmin: () => userHelpers.isAdmin(user),
        isSubAdmin: () => userHelpers.isSubAdmin(user),
        canViewRatings: () => userHelpers.canViewRatings(user),
        isInRole: (role) => userHelpers.isInRole(user, role),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { authService };
