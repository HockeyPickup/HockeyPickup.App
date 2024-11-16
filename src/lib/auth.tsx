import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserBasicResponse } from '../HockeyPickup.Api';

interface AuthContextType {
  user: UserBasicResponse | null;
  setUser: (user: UserBasicResponse | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [user, setUser] = useState<UserBasicResponse | null>(null);

  const isAuthenticated: boolean = Boolean(user);

  useEffect((): void => {
    // TODO: Add initial user fetch logic here
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated }}>
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
