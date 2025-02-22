import { useTitle } from '@/layouts/TitleContext';
import { ApiError } from '@/lib/error';
import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { JSX, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorDetail, RegisterRequest } from '../HockeyPickup.Api';
import { authService } from '../lib/auth';

export const RegisterPage = (): JSX.Element => {
  const { setPageInfo } = useTitle();
  useEffect(() => {
    setPageInfo('Register');
  }, [setPageInfo]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<ErrorDetail[]>([]);

  const form = useForm<RegisterRequest>({
    initialValues: {
      Email: '',
      Password: '',
      ConfirmPassword: '',
      FirstName: '',
      LastName: '',
      FrontendUrl: window.location.origin,
      InviteCode: '',
    },
    validate: {
      Email: (value) => (/^\S+@\S+$/.test(value.trim()) ? null : 'Invalid email'),
      Password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
      ConfirmPassword: (value, values) =>
        value !== values.Password ? 'Passwords do not match' : null,
      FirstName: (value) => (value.trim().length < 2 ? 'First name is too short' : null),
      LastName: (value) => (value.trim().length < 2 ? 'Last name is too short' : null),
      InviteCode: (value) => (value.trim().length < 2 ? 'Invite code is too short' : null),
    },
    transformValues: (values) => ({
      ...values,
      Email: values.Email.trim(),
      FirstName: values.FirstName.trim(),
      LastName: values.LastName.trim(),
      InviteCode: values.InviteCode.trim(),
      // Don't trim passwords as they might legitimately have spaces
    }),
  });

  const handleSubmit = async (values: RegisterRequest): Promise<void> => {
    setIsLoading(true);
    setApiErrors([]); // Clear previous errors
    try {
      const submitData = {
        ...values,
        FrontendUrl: window.location.origin,
      };
      const response = await authService.register(submitData);
      if (response.Success) {
        form.reset();
        notifications.show({
          position: 'top-center',
          autoClose: 5000,
          style: { marginTop: '60px' },
          title: 'Registration Successful!',
          message: `Thank you ${response.Data?.FirstName}, for registering. Please check your email for a confirmation link to activate your account.`,
          color: 'green',
        });
        navigate('/');
      } else if (response.Errors) {
        setApiErrors(response.Errors);
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Registration failed:', apiError.response?.data?.Errors);
      if (apiError.response?.data?.Errors) {
        setApiErrors(apiError.response?.data?.Errors);
      } else {
        setApiErrors([{ Message: 'An unexpected error occurred during registration' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container style={{ width: '800px' }} my={40}>
      <div style={{ maxWidth: 380, margin: '0 auto' }}>
        <Title ta='center'>Create an Account</Title>

        <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label='First Name'
                placeholder='John'
                required
                {...form.getInputProps('FirstName')}
              />
              <TextInput
                label='Last Name'
                placeholder='Doe'
                required
                {...form.getInputProps('LastName')}
              />
              <TextInput
                label='Email'
                placeholder='your@email.com'
                required
                {...form.getInputProps('Email')}
              />
              <PasswordInput
                label='Password'
                placeholder='Your password'
                required
                {...form.getInputProps('Password')}
              />
              <PasswordInput
                label='Confirm Password'
                placeholder='Confirm your password'
                required
                {...form.getInputProps('ConfirmPassword')}
              />
              <TextInput
                label='Invite Code'
                placeholder='Invite Code from Comissioner'
                required
                {...form.getInputProps('InviteCode')}
              />

              {apiErrors.length > 0 && (
                <Stack gap='xs'>
                  {apiErrors.map((error, index) => (
                    <Text key={index} c='red' size='sm'>
                      {error.Message}
                    </Text>
                  ))}
                </Stack>
              )}

              <Button type='submit' fullWidth mt='xs' loading={isLoading}>
                Register
              </Button>
            </Stack>
          </form>

          <Text c='dimmed' size='sm' ta='center' mt={20}>
            Already have an account?&nbsp;
            <Anchor size='sm' component='button' onClick={() => navigate('/login')}>
              Sign in
            </Anchor>
          </Text>
        </Paper>
      </div>
    </Container>
  );
};
