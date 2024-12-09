import { useTitle } from '@/layouts/TitleContext';
import { Button, Container, Paper, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { JSX, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ErrorDetail } from '../HockeyPickup.Api';
import { authService } from '../lib/auth';

export const ConfirmEmailPage = (): JSX.Element => {
  const { setTitle } = useTitle();
  useEffect(() => {
    setTitle('Confirm Email');
  }, [setTitle]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [apiErrors, setApiErrors] = useState<ErrorDetail[]>([]);

  useEffect(() => {
    let mounted = true;

    const confirmEmail = async (): Promise<void> => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        notifications.show({
          title: 'Invalid Link',
          message: 'The confirmation link is invalid or expired.',
          color: 'red',
        });
        navigate('/login');
        return;
      }

      try {
        if (!mounted) return; // Skip if component unmounted
        const response = await authService.confirmEmail({
          Token: token,
          Email: decodeURIComponent(email),
        });

        if (!mounted) return; // Skip if component unmounted

        if (response.Success) {
          notifications.show({
            title: 'Email Confirmed!',
            message: 'Your email has been confirmed. Please sign in.',
            color: 'green',
          });
          navigate('/login');
        } else if (response.Errors) {
          setApiErrors(response.Errors);
        }
      } catch (error: any) {
        if (!mounted) return; // Skip if component unmounted

        console.error('Email confirmation failed:', error.response?.data.Errors);
        if (error.response?.data?.Errors) {
          setApiErrors(error.response.data.Errors);
        } else {
          setApiErrors([{ Message: 'An unexpected error occurred during email confirmation' }]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    confirmEmail();

    return (): void => {
      mounted = false;
    };
  }, [navigate, searchParams]);

  return (
    <Container size={420} my={40}>
      <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
        {isLoading ? (
          <Text ta='center'>Confirming your email...</Text>
        ) : (
          <Stack>
            {apiErrors.length > 0 && (
              <Stack gap='xs'>
                {apiErrors.map((error, index) => (
                  <Text key={index} c='red' size='sm'>
                    {error.Message}
                  </Text>
                ))}
              </Stack>
            )}

            <Button fullWidth onClick={() => navigate('/login')}>
              Return to Login
            </Button>
          </Stack>
        )}
      </Paper>
    </Container>
  );
};
