import { TextInput, PasswordInput, Paper, Title, Container, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { LoginRequest } from '../HockeyPickup.Api';
import { authService } from '../services/auth';
import { useAuth } from '../lib/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

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
    try {
      const response = await authService.login(values);
      console.info(response);
      // TODO: Fetch user profile and set it
      setUser({ /* user data */ } as any); // We'll fix this when we add the user profile fetch
      navigate('/');
    } catch (error) {
      // TODO: Add error handling
      console.error('Login failed:', error);
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
              {...form.getInputProps('Username')}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              {...form.getInputProps('Password')}
            />

            <Button type="submit" fullWidth mt="xl">
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}