import { useTitle } from '@/layouts/TitleContext';
import { ApiError } from '@/lib/error';
import {
  Alert,
  Anchor,
  Button,
  Container,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { JSX, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ErrorDetail, ResetPasswordRequest } from '../HockeyPickup.Api';
import { authService } from '../lib/auth';

interface FormValues {
  newPassword: string;
  confirmPassword: string;
}

export const ResetPasswordPage = (): JSX.Element => {
  const { setPageInfo } = useTitle();
  useEffect(() => {
    setPageInfo('Reset Password');
  }, [setPageInfo]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [apiErrors, setApiErrors] = useState<ErrorDetail[]>([]);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const form = useForm<FormValues>({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      confirmPassword: (value, values) =>
        value !== values.newPassword ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values: FormValues): Promise<void> => {
    if (!token || !email) {
      return;
    }

    setIsLoading(true);
    setApiErrors([]); // Clear previous errors

    try {
      const resetRequest: ResetPasswordRequest = {
        Token: token,
        Email: decodeURIComponent(email),
        NewPassword: values.newPassword,
        ConfirmPassword: values.confirmPassword,
      };

      await authService.resetPassword(resetRequest);
      setIsSubmitted(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Password Reset failed:', apiError.response?.data?.Errors);
      if (apiError.response?.data?.Errors) {
        setApiErrors(apiError.response.data.Errors);
      } else {
        setApiErrors([{ Message: 'An unexpected error occurred during password reset' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <Container size={420} my={40}>
        <Alert color='red'>Invalid reset password link</Alert>
      </Container>
    );
  }

  if (isSubmitted) {
    return (
      <Container size={420} my={40}>
        <Title ta='center'>Password Reset Successful</Title>
        <Text c='dimmed' size='sm' ta='center' mt={20}>
          Your password has been reset. Redirecting to login...
        </Text>
      </Container>
    );
  }

  return (
    <Container style={{ width: '800px' }} my={40}>
      <div style={{ maxWidth: 380, margin: '0 auto' }}>
        <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
          <form onSubmit={form.onSubmit(handleSubmit)}>
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
              <TextInput
                label='New Password'
                type='password'
                required
                {...form.getInputProps('newPassword')}
              />
              <TextInput
                label='Confirm Password'
                type='password'
                required
                {...form.getInputProps('confirmPassword')}
              />

              <Button type='submit' fullWidth mt='xs' loading={isLoading}>
                Reset Password
              </Button>
            </Stack>
          </form>

          <Text c='dimmed' size='sm' ta='center' mt={20}>
            Remember your password?&nbsp;
            <Anchor size='sm' component='button' onClick={() => navigate('/login')}>
              Back to login
            </Anchor>
          </Text>
        </Paper>
      </div>
    </Container>
  );
};
