import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { MainLayout } from './layouts/MainLayout';
import { useAuth } from './lib/auth';

type ProtectedRouteProps = {
  children: JSX.Element;  // Changed from React.ReactNode
};

const ProtectedRoute = ({ children }: ProtectedRouteProps): JSX.Element => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = (): JSX.Element => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>Home Page</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MainLayout>
  );
};

export default AppRoutes;