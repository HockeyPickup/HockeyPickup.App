import styles from '@/App.module.css';
import { AvatarUpload } from '@/components/AvatarUpload';
import { useTitle } from '@/layouts/TitleContext';
import { authService, useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/error';
import { userPaymentService } from '@/lib/user';
import { AvatarService } from '@/services/avatar';
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Container,
  Group,
  Modal,
  NumberInput,
  Paper,
  PasswordInput,
  Select,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconEdit,
  IconLock,
  IconPlus,
  IconSettings,
  IconTrash,
  IconWallet,
} from '@tabler/icons-react';
import { JSX, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChangePasswordRequest,
  ErrorDetail,
  NotificationPreference,
  PaymentMethodType,
  PositionPreference,
  SaveUserRequest,
  UserPaymentMethodRequest,
  UserPaymentMethodResponse,
} from '../HockeyPickup.Api';

const PaymentMethodModal = ({
  opened,
  onClose,
  initialValues,
  onSubmit,
}: {
  opened: boolean;
  onClose: () => void;
  initialValues?: UserPaymentMethodResponse; // Changed from UserPaymentMethodRequest
  onSubmit: (_values: UserPaymentMethodRequest) => Promise<void>;
}): JSX.Element => {
  const form = useForm<UserPaymentMethodRequest>({
    initialValues: initialValues ?? {
      MethodType: PaymentMethodType.PayPal,
      Identifier: '',
      PreferenceOrder: 1,
      IsActive: true,
    },
  });

  // Reset form when modal opens/closes or initialValues change
  useEffect(() => {
    if (initialValues) {
      form.setValues({
        MethodType: initialValues.MethodType,
        Identifier: initialValues.Identifier,
        PreferenceOrder: initialValues.PreferenceOrder,
        IsActive: initialValues.IsActive,
      });
    } else {
      form.reset();
    }
  }, [opened, initialValues]);

  return (
    <Modal opened={opened} onClose={onClose} title='Payment Method' size='md'>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <Select
            label='Payment Type'
            data={[
              { value: PaymentMethodType.PayPal.toString(), label: 'PayPal' },
              { value: PaymentMethodType.Venmo.toString(), label: 'Venmo' },
              { value: PaymentMethodType.CashApp.toString(), label: 'Cash App' },
              { value: PaymentMethodType.Zelle.toString(), label: 'Zelle' },
              { value: PaymentMethodType.Bitcoin.toString(), label: 'Bitcoin' },
            ]}
            value={form.values.MethodType.toString()}
            onChange={(value) =>
              form.setFieldValue(
                'MethodType',
                value ? (parseInt(value) as PaymentMethodType) : PaymentMethodType.PayPal,
              )
            }
          />
          <TextInput
            label='Identifier'
            placeholder='Email or username'
            {...form.getInputProps('Identifier')}
          />
          <NumberInput
            label='Preference Order'
            min={1}
            max={100}
            {...form.getInputProps('PreferenceOrder')}
          />
          <Switch label='Active' {...form.getInputProps('IsActive', { type: 'checkbox' })} />
          <Group justify='flex-end'>
            <Button variant='default' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit'>Save</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

const PaymentMethodsSection = (): JSX.Element => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<UserPaymentMethodResponse[]>([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingMethod, setEditingMethod] = useState<UserPaymentMethodResponse | null>(null);

  const loadPaymentMethods = async (): Promise<void> => {
    if (!user?.Id) return;
    const methods = await userPaymentService.getPaymentMethods(user.Id);
    if (methods) {
      setPaymentMethods(methods.sort((a, b) => a.PreferenceOrder - b.PreferenceOrder));
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, [user?.Id]);

  const handleSubmit = async (values: UserPaymentMethodRequest): Promise<void> => {
    if (!user?.Id) return;

    try {
      let response;
      if (editingMethod) {
        response = await userPaymentService.updatePaymentMethod(
          user.Id,
          editingMethod.UserPaymentMethodId,
          values,
        );
      } else {
        response = await userPaymentService.addPaymentMethod(user.Id, values);
      }

      if (response?.Success) {
        await loadPaymentMethods();
        setModalOpened(false);
        setEditingMethod(null);
        notifications.show({
          position: 'top-center',
          autoClose: 5000,
          style: { marginTop: '60px' },
          title: 'Success',
          message:
            response.Message ??
            `Payment method ${editingMethod ? 'updated' : 'added'} successfully`,
          color: 'green',
        });
      } else {
        const errorMessage = response?.Errors?.[0]?.Message ?? 'Failed to save payment method';
        notifications.show({
          position: 'top-center',
          autoClose: 5000,
          style: { marginTop: '60px' },
          title: 'Error',
          message: errorMessage,
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Error saving payment method:', error);
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Error',
        message: 'An unexpected error occurred while saving the payment method',
        color: 'red',
      });
    }
  };

  const handleDelete = async (methodId: number): Promise<void> => {
    if (!user?.Id) return;

    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        const response = await userPaymentService.deletePaymentMethod(user.Id, methodId);

        if (response?.Success) {
          await loadPaymentMethods();
          notifications.show({
            position: 'top-center',
            autoClose: 5000,
            style: { marginTop: '60px' },
            title: 'Success',
            message: response.Message ?? 'Payment method deleted successfully',
            color: 'green',
          });
        } else {
          const errorMessage = response?.Errors?.[0]?.Message ?? 'Failed to delete payment method';
          notifications.show({
            position: 'top-center',
            autoClose: 5000,
            style: { marginTop: '60px' },
            title: 'Error',
            message: errorMessage,
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Error deleting payment method:', error);
        notifications.show({
          position: 'top-center',
          autoClose: 5000,
          style: { marginTop: '60px' },
          title: 'Error',
          message: 'An unexpected error occurred while deleting the payment method',
          color: 'red',
        });
      }
    }
  };
  const getMethodTypeLabel = (type: PaymentMethodType): string => {
    const labels: Record<PaymentMethodType, string> = {
      [PaymentMethodType.PayPal]: 'PayPal',
      [PaymentMethodType.Venmo]: 'Venmo',
      [PaymentMethodType.CashApp]: 'Cash App',
      [PaymentMethodType.Zelle]: 'Zelle',
      [PaymentMethodType.Bitcoin]: 'Bitcoin',
    };
    return labels[type];
  };

  return (
    <Paper withBorder shadow='md' p='xl' radius='md'>
      <Stack gap='md'>
        <Group justify='space-between'>
          <Title order={2}>Payment Methods</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              setEditingMethod(null);
              setModalOpened(true);
            }}
          >
            Add Method
          </Button>
        </Group>

        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Type</Table.Th>
              <Table.Th>Identifier</Table.Th>
              <Table.Th>Order</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paymentMethods.map((method) => (
              <Table.Tr key={method.UserPaymentMethodId}>
                <Table.Td>{getMethodTypeLabel(method.MethodType)}</Table.Td>
                <Table.Td>{method.Identifier}</Table.Td>
                <Table.Td>{method.PreferenceOrder}</Table.Td>
                <Table.Td>
                  <Badge color={method.IsActive ? 'green' : 'gray'}>
                    {method.IsActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap='xs'>
                    <ActionIcon
                      variant='subtle'
                      onClick={() => {
                        setEditingMethod(method);
                        setModalOpened(true);
                      }}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant='subtle'
                      color='red'
                      onClick={() => handleDelete(method.UserPaymentMethodId)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {paymentMethods.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={5} style={{ textAlign: 'center' }}>
                  <Text c='dimmed'>No payment methods configured</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>

        <PaymentMethodModal
          opened={modalOpened}
          onClose={() => {
            setModalOpened(false);
            setEditingMethod(null);
          }}
          initialValues={editingMethod ?? undefined}
          onSubmit={handleSubmit}
        />
      </Stack>
    </Paper>
  );
};

const PaymentsSection = (): JSX.Element => (
  <Stack gap='xl'>
    <PaymentMethodsSection />

    <Paper withBorder shadow='md' p='xl' radius='md'>
      <Stack gap='md'>
        <Title order={2}>Payments Due</Title>
        {/* Add your payments due table/list here */}
        <Text size='sm' c='dimmed'>
          No payments due
        </Text>
      </Stack>
    </Paper>

    <Paper withBorder shadow='md' p='xl' radius='md'>
      <Stack gap='md'>
        <Title order={2}>Payment History</Title>
        {/* Add your payment history table/list here */}
        <Text size='sm' c='dimmed'>
          No previous payments
        </Text>
      </Stack>
    </Paper>
  </Stack>
);
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
          position: 'top-center',
          autoClose: 5000,
          style: { marginTop: '60px' },
          title: 'Success',
          message: 'Your password has been changed successfully',
          color: 'green',
        });
      } else if (response.Errors) {
        setApiErrors(response.Errors);
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Password change failed:', apiError.response?.data?.Errors);
      if (apiError.response?.data?.Errors) {
        setApiErrors(apiError.response.data.Errors);
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
  const { setUser, user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const refreshUser = async (): Promise<void> => {
    await authService.refreshUser(setUser);
  };

  const refreshAvatar = async (): Promise<void> => {
    const url = await AvatarService.getAvatarUrl(user?.PhotoUrl ?? '');
    setAvatarUrl(url);
  };

  useEffect(() => {
    refreshAvatar();
  }, [user]);

  const form = useForm<SaveUserRequest>({
    initialValues: {
      FirstName: user?.FirstName ?? '',
      LastName: user?.LastName ?? '',
      PayPalEmail: user?.PayPalEmail ?? '',
      VenmoAccount: user?.VenmoAccount ?? '',
      MobileLast4: user?.MobileLast4 ?? '',
      EmergencyName: user?.EmergencyName ?? '',
      EmergencyPhone: user?.EmergencyPhone ?? '',
      JerseyNumber: user?.JerseyNumber ?? 0,
      NotificationPreference: user?.NotificationPreference ?? NotificationPreference.None,
      PositionPreference: user?.PositionPreference ?? PositionPreference.TBD,
    },
    validate: {
      FirstName: (value) => (!value ? 'First name is required' : null),
      LastName: (value) => (!value ? 'Last name is required' : null),
      JerseyNumber: (value) => {
        if (value === null || value === undefined) return null;
        const num = Number(value);
        if (!Number.isInteger(num)) return 'Must be a whole number';
        if (num < 0 || num > 98) return 'Must be between 0 and 98';
        return null;
      },
      PayPalEmail: (value) => {
        if (!value) return 'PayPal email is required';
        return /^\S+@\S+$/.test(value) ? null : 'Invalid email format';
      },
      MobileLast4: (value) => (value ? (/^\d{4}$/.test(value) ? null : 'Must be 4 digits') : null),
      EmergencyPhone: (value) =>
        value
          ? /^\+?1?\s*\(?[0-9]{3}\)?[-\s.]*[0-9]{3}[-\s.]*[0-9]{4}$/.test(value)
            ? null
            : 'Invalid phone number'
          : null,
    },
  });

  const handleSubmit = async (values: SaveUserRequest): Promise<void> => {
    setIsLoading(true);
    setApiErrors([]);

    try {
      const response = await authService.saveUser(values);
      if (response.Success) {
        await refreshUser();
        notifications.show({
          position: 'top-center',
          autoClose: 5000,
          style: { marginTop: '60px' },
          title: 'Success',
          message: 'Your preferences have been updated successfully',
          color: 'green',
        });
      } else if (response.Errors) {
        setApiErrors(response.Errors);
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Save preferences failed:', apiError.response?.data?.Errors);
      if (apiError.response?.data?.Errors) {
        setApiErrors(apiError.response.data.Errors);
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
          <AvatarUpload onUploadSuccess={refreshUser} />
          <Stack>
            <Avatar
              src={avatarUrl}
              alt={`${user?.FirstName} ${user?.LastName}`}
              size={120}
              radius='sm'
            />
          </Stack>
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
            label='Jersey Number'
            placeholder='0'
            maxLength={2}
            {...form.getInputProps('JerseyNumber')}
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
          />
          <Select
            label='Position Preference'
            data={[
              { value: PositionPreference.TBD.toString(), label: 'TBD' },
              { value: PositionPreference.Forward.toString(), label: 'Forward' },
              { value: PositionPreference.Defense.toString(), label: 'Defense' },
              { value: PositionPreference.Goalie.toString(), label: 'Goalie' },
            ]}
            value={form.values.PositionPreference?.toString()}
            onChange={(value) =>
              form.setFieldValue(
                'PositionPreference',
                value ? (parseInt(value) as PositionPreference) : null,
              )
            }
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
          <Button type='submit' fullWidth loading={isLoading}>
            Save Preferences
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

export const AccountPage = (): JSX.Element => {
  const { setPageInfo } = useTitle();
  const { user } = useAuth();

  useEffect(() => {
    setPageInfo('Account', 'Hockey Pickup Player Account');
  }, [setPageInfo]);

  const [avatarUrl, setAvatarUrl] = useState<string>('');
  useEffect(() => {
    const loadAvatar = async (): Promise<void> => {
      const url = await AvatarService.getAvatarUrl(user?.PhotoUrl ?? '');
      setAvatarUrl(url);
    };
    loadAvatar();
  }, [user?.PhotoUrl]);

  return (
    <Container size='xl' mb={70}>
      <Paper withBorder shadow='sm' radius='md' p='md' mb='xl'>
        <Group justify='space-between' align='center'>
          <Group>
            <Avatar
              src={avatarUrl}
              size='lg'
              radius='xl'
              alt={`${user?.FirstName} ${user?.LastName}`}
            />
            <Stack gap={0}>
              <Text size='lg' fw={500}>{`${user?.FirstName} ${user?.LastName}`}</Text>
              <Text size='sm' c='dimmed'>
                {user?.Email}
              </Text>
            </Stack>
          </Group>
          <Link to={`/profile/${user?.Id}`}>
            <Button variant='light'>View Player Profile</Button>
          </Link>
        </Group>
      </Paper>

      <Tabs variant='outline' defaultValue='payments' classNames={{ root: styles.accountTabs }}>
        <Paper withBorder shadow='sm' radius='md' mb='xl'>
          <Tabs.List grow>
            <Tabs.Tab value='payments' leftSection={<IconWallet size={16} />}>
              Payments
            </Tabs.Tab>
            <Tabs.Tab value='preferences' leftSection={<IconSettings size={16} />}>
              Preferences
            </Tabs.Tab>
            <Tabs.Tab value='password' leftSection={<IconLock size={16} />}>
              Security
            </Tabs.Tab>
          </Tabs.List>
        </Paper>

        <div style={{ padding: '20px 0' }}>
          <Tabs.Panel value='payments'>
            <PaymentsSection />
          </Tabs.Panel>
          <Tabs.Panel value='preferences'>
            <PreferencesSection />
          </Tabs.Panel>
          <Tabs.Panel value='password'>
            <PasswordSection />
          </Tabs.Panel>
        </div>
      </Tabs>
    </Container>
  );
};
