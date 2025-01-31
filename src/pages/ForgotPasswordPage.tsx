import { useTitle } from '@/layouts/TitleContext';
import { Anchor, Button, Container, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { JSX, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../lib/auth';

export const ForgotPasswordPage = (): JSX.Element => {
  const { setPageInfo } = useTitle();
  useEffect(() => {
    setPageInfo('Forgot Password');
  }, [setPageInfo]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: { email: string }): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(values.email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset request failed:', error);
      form.setErrors({ email: 'Failed to process request' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Container size={420} my={40}>
        <Title ta='center'>Check Your Email</Title>
        <Text c='dimmed' size='sm' ta='center' mt={20}>
          If your account exists, we&apos;ve sent password reset instructions to your email address.
        </Text>
        <Button fullWidth mt='xl' onClick={() => navigate('/login')}>
          Return to Login
        </Button>
      </Container>
    );
  }

  return (
    <Container size={420} my={40}>
      <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label='Email'
              placeholder='your@email.com'
              required
              {...form.getInputProps('email')}
            />

            <Button type='submit' fullWidth mt='xl' loading={isLoading}>
              Reset Password
            </Button>
          </Stack>
        </form>

        <Text c='dimmed' size='sm' ta='center' mt={20}>
          Remember your password?&nbsp;
          <Anchor size='sm' component='button' onClick={() => navigate('/')}>
            Back to home
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};
