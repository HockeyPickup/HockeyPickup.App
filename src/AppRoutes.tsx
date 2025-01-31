import { JSX } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { useAuth } from './lib/auth';
import { AboutPage } from './pages/AboutPage';
import { AccountPage } from './pages/AccountPage';
import { CalendarPage } from './pages/CalendarPage';
import { ConfirmEmailPage } from './pages/ConfirmEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { GamePucksPage } from './pages/GamePucksPage';
import { GoalieLoungePage } from './pages/GoalieLoungePage';
import { HomePage } from './pages/HomePage';
import { LockerRoom13Page } from './pages/LockerRoom13Page';
import { LoginPage } from './pages/LoginPage';
import { PlayersPage } from './pages/PlayersPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';
import { RegularsPage } from './pages/RegularsPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { SessionFormPage } from './pages/SessionFormPage';
import { SessionPage } from './pages/SessionPage';
import { SessionsPage } from './pages/SessionsPage';
import { VersionPage } from './pages/VersionPage';

type ProtectedRouteProps = {
  children: JSX.Element;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps): JSX.Element => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Wait for auth to initialize before making a decision
  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  return user ? children : <Navigate to='/login' state={{ from: location }} replace />;
};

const AppRoutes = (): JSX.Element => {
  return (
    <MainLayout>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/about' element={<AboutPage />} />
        <Route path='/confirm-email' element={<ConfirmEmailPage />} />
        <Route path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route path='/lockerroom13' element={<LockerRoom13Page />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/privacy' element={<PrivacyPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/reset-password' element={<ResetPasswordPage />} />
        <Route path='/version' element={<VersionPage />} />
        <Route
          path='/goalie-lounge'
          element={
            <ProtectedRoute>
              <GoalieLoungePage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile/:userId'
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/calendar'
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/account'
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/sessions'
          element={
            <ProtectedRoute>
              <SessionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/sessions/new'
          element={
            <ProtectedRoute>
              <SessionFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/sessions/:sessionId/edit'
          element={
            <ProtectedRoute>
              <SessionFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/session/:sessionId'
          element={
            <ProtectedRoute>
              <SessionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/players'
          element={
            <ProtectedRoute>
              <PlayersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/regulars'
          element={
            <ProtectedRoute>
              <RegularsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/game-pucks'
          element={
            <ProtectedRoute>
              <GamePucksPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MainLayout>
  );
};

export default AppRoutes;
