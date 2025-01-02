import { useTitle } from '@/layouts/TitleContext';
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
import { useNavigate } from 'react-router-dom';
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
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      form.setErrors({ UserName: 'Invalid credentials' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
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
              <Anchor
                component='button'
                type='button'
                c='dimmed'
                size='sm'
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
              </Anchor>
            </Group>

            <Button type='submit' fullWidth mt='xl' loading={isLoading}>
              Sign in
            </Button>
          </Stack>
        </form>

        <Text c='dimmed' size='sm' ta='center' mt={20}>
          Don&apos;t have an account?{' '}
          <Anchor size='sm' component='button' onClick={() => navigate('/register')}>
            Create account
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};
