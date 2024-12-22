import { ApolloProvider } from '@apollo/client';
import '@mantine/carousel/styles.css';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { JSX } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { LoadingSpinner } from './components/LoadingSpinner';
import { TitleProvider } from './layouts/TitleContext';
import { VersionChecker } from './layouts/VersionChecker';
import { AuthProvider, useAuth } from './lib/auth';
import { theme } from './lib/theme';
import { apolloClient } from './services/graphql';

// Configure query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const AuthWrapper = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};

const App = (): JSX.Element => {
  return (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme} defaultColorScheme='dark'>
          <Notifications position='top-right' zIndex={1000} />
          <VersionChecker />
          <BrowserRouter>
            <TitleProvider>
              <AuthProvider>
                <AuthWrapper>
                  <AppRoutes />
                </AuthWrapper>
              </AuthProvider>
            </TitleProvider>
          </BrowserRouter>
        </MantineProvider>
      </QueryClientProvider>
    </ApolloProvider>
  );
};

export default App;
