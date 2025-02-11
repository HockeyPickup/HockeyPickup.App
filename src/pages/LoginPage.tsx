import { useTitle } from '@/layouts/TitleContext';
import useGoogleAnalytics from '@/lib/googleAnalytics';
import {
  Anchor,
  Button,
  Container,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { JSX, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoginRequest } from '../HockeyPickup.Api';
import { authService, useAuth } from '../lib/auth';

export const LoginPage = (): JSX.Element => {
  const { setPageInfo } = useTitle();
  useEffect(() => {
    setPageInfo('Login');
  }, [setPageInfo]);
  const navigate = useNavigate();
  const { setUser, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const { trackEvent } = useGoogleAnalytics();

  const form = useForm<LoginRequest>({
    initialValues: {
      UserName: '',
      Password: '',
    },
    validate: {
      UserName: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      Password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
    },
  });

  const handleSubmit = async (values: LoginRequest): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authService.login(values);
      if (response.Success && response.Data) {
        setUser(response.Data.UserDetailedResponse);
        await refreshUser(); // Refresh user data after login
        trackEvent('login', 'authentication', values.UserName);
        navigate(from); // Navigate to the stored path
      }
    } catch (error) {
      console.error('Login failed:', error);
      trackEvent('login_failed', 'authentication', values.UserName);
      form.setErrors({ UserName: 'Invalid credentials' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container style={{ width: '800px' }} my={40}>
      <div style={{ maxWidth: 380, margin: '0 auto' }}>
        <Title ta='center'>Welcome Back</Title>
        <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label='Email'
                placeholder='your@email.com'
                required
                autoComplete='username email'
                {...form.getInputProps('UserName')}
              />

              <PasswordInput
                label='Password'
                placeholder='Your password'
                required
                autoComplete='current-password'
                {...form.getInputProps('Password')}
              />

              <Group justify='space-between' mt='xs'>
                <Anchor size='sm' component='button' onClick={() => navigate('/forgot-password')}>
                  Forgot password?
                </Anchor>
              </Group>

              <Button type='submit' fullWidth mt='xs' loading={isLoading}>
                Sign in
              </Button>
            </Stack>
          </form>

          <Text c='dimmed' size='sm' ta='center' mt={20}>
            Don&apos;t have an account?&nbsp;
            <Anchor size='sm' component='button' onClick={() => navigate('/register')}>
              Create account
            </Anchor>
          </Text>
        </Paper>
      </div>
    </Container>
  );
};
