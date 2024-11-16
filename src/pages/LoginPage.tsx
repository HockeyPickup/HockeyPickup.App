import { TextInput, PasswordInput, Paper, Title, Container, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { LoginRequest } from '../HockeyPickup.Api';
import { authService } from '../services/auth';
import { useAuth } from '../lib/auth';
import { useState } from 'react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginRequest>({
    initialValues: {
      Username: '',
      Password: '',
    },
    validate: {
      Username: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      Password: (value) => (value.length >= 8 ? null : 'Password must be at least 8 characters'),
    },
  });

  const handleSubmit = async (values: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(values);
      if (response.Token) {
        setUser({ /* user data */ } as any);
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      form.setErrors({ Username: 'Invalid credentials' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Welcome Back</Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="your@email.com"
              required
              autoComplete="username email"
              {...form.getInputProps('Username')}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              autoComplete="current-password"
              {...form.getInputProps('Password')}
            />

            <Button type="submit" fullWidth mt="xl" loading={isLoading}>
                Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};