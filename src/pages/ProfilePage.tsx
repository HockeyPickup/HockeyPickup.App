import styles from '@/App.module.css';
import { useTitle } from '@/layouts/TitleContext';
import { authService, useAuth } from '@/lib/auth';
import {
  Button,
  Container,
  Group,
  Paper,
  PasswordInput,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import moment from 'moment';
import { useEffect, useState } from 'react';
import {
  ChangePasswordRequest,
  ErrorDetail,
  NotificationPreference,
  SaveUserRequest,
} from '../HockeyPickup.Api';

const HeaderSection = (): JSX.Element => {
  const { user } = useAuth();

  if (!user) return <></>;

  return (
    <Paper withBorder p='md' mb='lg' bg='var(--mantine-color-dark-7)'>
      <Title order={2} mb='md'>
        Welcome, {user.FirstName} {user.LastName}
      </Title>
      <Group>
        <Text size='sm'>
          Active:{' '}
          <Text span c={user.Active ? 'green.6' : 'red.6'}>
            {user.Active ? '✓' : '✗'}
          </Text>
        </Text>
        <Text size='sm'>
          Preferred:{' '}
          <Text span c={user.Preferred ? 'green.6' : 'red.6'}>
            {user.Preferred ? '✓' : '✗'}
          </Text>
        </Text>
        <Text size='sm'>
          Preferred Plus:{' '}
          <Text span c={user.PreferredPlus ? 'green.6' : 'red.6'}>
            {user.PreferredPlus ? '✓' : '✗'}
          </Text>
        </Text>
        <Text size='sm'>
          Locker Room 13:{' '}
          <Text span c={user.LockerRoom13 ? 'green.6' : 'red.6'}>
            {user.LockerRoom13 ? '✓' : '✗'}
          </Text>
        </Text>
      </Group>
      <br />
      <Group>
        <Text size='sm'>
          Player Since:{' '}
          <Text span fw={500}>
            {moment.utc(user.DateCreated).local().format('MM/DD/yyyy')}
          </Text>
        </Text>
        <Text size='sm'>
          Number of Sessions Played:{' '}
          <Text span fw={500}>
            999
          </Text>
        </Text>
        <Text size='sm'>
          Last Session Played:{' '}
          <Text span fw={500}>
            01/01/2030
          </Text>
        </Text>
      </Group>
    </Paper>
  );
};
// Basic components for each section
const PaymentsSection = (): JSX.Element => <Text>Payments Due / Received</Text>;

const PasswordSection = (): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<ErrorDetail[]>([]);

  const form = useForm<ChangePasswordRequest>({
    initialValues: {
      CurrentPassword: '',
      NewPassword: '',
      ConfirmNewPassword: '',
    },
    validate: {
      CurrentPassword: (value) => (value.length < 6 ? 'Current password is required' : null),
      NewPassword: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
      ConfirmNewPassword: (value, values) =>
        value !== values.NewPassword ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values: ChangePasswordRequest): Promise<void> => {
    setIsLoading(true);
    setApiErrors([]);

    try {
      const response = await authService.changePassword(values);
      if (response.Success) {
        form.reset();
        notifications.show({
          title: 'Success',
          message: 'Your password has been changed successfully',
          color: 'green',
          autoClose: false,
          withCloseButton: true,
        });
      } else if (response.Errors) {
        setApiErrors(response.Errors);
      }
    } catch (error: any) {
      console.error('Password change failed:', error.response?.data.Errors);
      if (error.response?.data?.Errors) {
        setApiErrors(error.response.data.Errors);
      } else {
        setApiErrors([{ Message: 'An unexpected error occurred while changing your password' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper withBorder shadow='md' p={30} radius='md' style={{ maxWidth: 420 }}>
      <Title size='xl'>Change Password</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <PasswordInput
            label='Current Password'
            placeholder='Enter current password'
            required
            {...form.getInputProps('CurrentPassword')}
          />
          <PasswordInput
            label='New Password'
            placeholder='Enter new password'
            required
            {...form.getInputProps('NewPassword')}
          />
          <PasswordInput
            label='Confirm New Password'
            placeholder='Confirm new password'
            required
            {...form.getInputProps('ConfirmNewPassword')}
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

          <Button type='submit' fullWidth mt='xl' loading={isLoading}>
            Change Password
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

const PreferencesSection = (): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<ErrorDetail[]>([]);
  const { user } = useAuth();

  const form = useForm<SaveUserRequest>({
    initialValues: {
      FirstName: user?.FirstName ?? '',
      LastName: user?.LastName ?? '',
      PayPalEmail: user?.PayPalEmail ?? '',
      VenmoAccount: user?.VenmoAccount ?? '',
      MobileLast4: user?.MobileLast4 ?? '',
      EmergencyName: user?.EmergencyName ?? '',
      EmergencyPhone: user?.EmergencyPhone ?? '',
      NotificationPreference: user?.NotificationPreference ?? NotificationPreference.None,
    },
    validate: {
      FirstName: (value) => (!value ? 'First name is required' : null),
      LastName: (value) => (!value ? 'Last name is required' : null),
      PayPalEmail: (value) => {
        if (!value) return 'PayPal email is required';
        return /^\S+@\S+$/.test(value) ? null : 'Invalid email format';
      },
      MobileLast4: (value) => (value ? (/^\d{4}$/.test(value) ? null : 'Must be 4 digits') : null),
      EmergencyPhone: (value) =>
        value ? (/^\+?[\d\s-]{10,}$/.test(value) ? null : 'Invalid phone number') : null,
    },
  });

  const handleSubmit = async (values: SaveUserRequest): Promise<void> => {
    setIsLoading(true);
    setApiErrors([]);

    try {
      const response = await authService.saveUser(values);
      if (response.Success) {
        notifications.show({
          title: 'Success',
          message: 'Your preferences have been updated successfully',
          color: 'green',
          autoClose: false,
          withCloseButton: true,
        });
      } else if (response.Errors) {
        setApiErrors(response.Errors);
      }
    } catch (error: any) {
      console.error('Save preferences failed:', error.response?.data.Errors);
      if (error.response?.data?.Errors) {
        setApiErrors(error.response.data.Errors);
      } else {
        setApiErrors([{ Message: 'An unexpected error occurred while saving preferences' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper withBorder shadow='md' p={30} radius='md' style={{ maxWidth: 420 }}>
      <Title size='xl'>Preferences</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label='First Name'
            placeholder='Your first name'
            {...form.getInputProps('FirstName')}
          />
          <TextInput
            label='Last Name'
            placeholder='Your last name'
            {...form.getInputProps('LastName')}
          />
          <TextInput
            label='PayPal Email'
            placeholder='email@example.com'
            {...form.getInputProps('PayPalEmail')}
          />
          <TextInput
            label='Venmo Account'
            placeholder='@username'
            {...form.getInputProps('VenmoAccount')}
          />
          <TextInput
            label='Mobile Last 4 Digits'
            placeholder='1234'
            maxLength={4}
            {...form.getInputProps('MobileLast4')}
          />
          <TextInput
            label='Emergency Contact Name'
            placeholder='Contact name'
            {...form.getInputProps('EmergencyName')}
          />
          <TextInput
            label='Emergency Contact Phone'
            placeholder='+1 234 567 8900'
            {...form.getInputProps('EmergencyPhone')}
          />
          <Select
            label='Notification Preference'
            data={[
              { value: NotificationPreference.None.toString(), label: 'None' },
              { value: NotificationPreference.All.toString(), label: 'All' },
              { value: NotificationPreference.OnlyMyBuySell.toString(), label: 'Only My Buy/Sell' },
            ]}
            value={form.values.NotificationPreference?.toString()}
            onChange={(value) =>
              form.setFieldValue(
                'NotificationPreference',
                value ? (parseInt(value) as NotificationPreference) : null,
              )
            }
          />{' '}
          {apiErrors.length > 0 && (
            <Stack gap='xs'>
              {apiErrors.map((error, index) => (
                <Text key={index} c='red' size='sm'>
                  {error.Message}
                </Text>
              ))}
            </Stack>
          )}
          <Button type='submit' fullWidth mt='xl' loading={isLoading}>
            Save Preferences
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

export const ProfilePage = (): JSX.Element => {
  const { setTitle } = useTitle();
  const isMobile = useMediaQuery('(max-width: 48em)');
  useEffect(() => {
    setTitle('Profile');
  }, [setTitle]);

  return (
    <Container size='xl'>
      <HeaderSection />
      <Tabs
        variant='pills'
        orientation={isMobile ? 'horizontal' : 'vertical'}
        defaultValue='payments'
        classNames={{ root: styles.profileTabs }}
      >
        <Tabs.List w={isMobile ? '100%' : 200} mb={isMobile ? 'md' : 0}>
          <Tabs.Tab value='payments'>Payments Due / Received</Tabs.Tab>
          <Tabs.Tab value='password'>Change Password</Tabs.Tab>
          <Tabs.Tab value='preferences'>Preferences</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value='payments' pl={isMobile ? 0 : 'xl'}>
          <PaymentsSection />
        </Tabs.Panel>
        <Tabs.Panel value='password' pl={isMobile ? 0 : 'xl'}>
          <PasswordSection />
        </Tabs.Panel>
        <Tabs.Panel value='preferences' pl={isMobile ? 0 : 'xl'}>
          <PreferencesSection />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};
