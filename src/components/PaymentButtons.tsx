import { PaymentMethod, UserDetailedResponse, UserPaymentMethodResponse } from '@/HockeyPickup.Api';
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCreditCard } from '@tabler/icons-react';
import { JSX, useState } from 'react';
import { BsCreditCard2Front } from 'react-icons/bs';
import { FaBitcoin, FaPaypal } from 'react-icons/fa';
import { SiCashapp, SiVenmo } from 'react-icons/si';

interface PaymentButtonsProps {
  user: UserDetailedResponse;
  defaultAmount?: number;
  defaultDescription?: string;
}

interface PaymentForm {
  amount: number;
  description: string;
}

const PAYMENT_METHODS = {
  [PaymentMethod.PayPal]: { icon: FaPaypal, label: 'PayPal' },
  [PaymentMethod.Venmo]: { icon: SiVenmo, label: 'Venmo' },
  [PaymentMethod.CashApp]: { icon: SiCashapp, label: 'Cash App' },
  [PaymentMethod.Zelle]: { icon: BsCreditCard2Front, label: 'Zelle' },
  [PaymentMethod.Bitcoin]: { icon: FaBitcoin, label: 'Bitcoin' },
};

const getPaymentUrl = (
  method: UserPaymentMethodResponse,
  amount: number,
  description: string,
): string => {
  const encodedDesc = encodeURIComponent(description);

  switch (method.MethodType) {
    case PaymentMethod.Venmo:
      return `https://venmo.com/${method.Identifier}?txn=pay&note=${encodedDesc}&amount=${amount}`;
    case PaymentMethod.CashApp:
      return `https://cash.app/$${method.Identifier}/${amount}?note=${encodedDesc}`;
    case PaymentMethod.PayPal:
      return `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${method.Identifier}&amount=${amount}&item_name=${encodedDesc}&currency_code=USD`;
    case PaymentMethod.Zelle:
      return method.Identifier;
    case PaymentMethod.Bitcoin:
      return method.Identifier;
    default:
      return '';
  }
};

const getPaymentMethodInfo = (
  methodType: PaymentMethod,
): { icon: React.ComponentType; label: string } => {
  const defaultInfo = { icon: IconCreditCard, label: 'Unknown Method' };
  return PAYMENT_METHODS[methodType] || defaultInfo;
};

export const PaymentButtons = ({
  user,
  defaultAmount = 27,
  defaultDescription = 'Pickup Hockey Profile Payment',
}: PaymentButtonsProps): JSX.Element => {
  const [opened, setOpened] = useState(false);
  const form = useForm<PaymentForm>({
    initialValues: {
      amount: defaultAmount,
      description: defaultDescription,
    },
    validate: {
      amount: (value) => (value <= 0 ? 'Amount must be greater than 0' : null),
      description: (value) => (!value ? 'Description is required' : null),
    },
  });

  const handlePayment = (method: UserPaymentMethodResponse): void => {
    const url = getPaymentUrl(method, form.values.amount, form.values.description);

    if (method.MethodType === PaymentMethod.Zelle || method.MethodType === PaymentMethod.Bitcoin) {
      navigator.clipboard.writeText(url);
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Copied!',
        message: `${PAYMENT_METHODS[method.MethodType].label} address copied to clipboard`,
        color: 'green',
      });
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <>
      <Button
        size='xs'
        radius='xl'
        onClick={() => setOpened(true)}
        leftSection={<IconCreditCard size={16} />}
        styles={{
          root: {
            paddingLeft: 14,
            paddingRight: 14,
            height: 22,
          },
          section: {
            marginRight: 4,
          },
        }}
      >
        Pay {user.FirstName}
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          <Title order={3}>
            Pay {user.FirstName} {user.LastName}
          </Title>
        }
      >
        <Stack>
          <form>
            <TextInput
              label='Amount'
              type='number'
              step='0.01'
              {...form.getInputProps('amount')}
              leftSection={<Text>$</Text>}
            />
            <TextInput label='Description' {...form.getInputProps('description')} mt='sm' />
          </form>

          <Title order={4} mt='md'>
            Payment Methods
            <Text span size='xs' c='dimmed' ml={4} fw={400}>
              (in order of preference)
            </Text>
          </Title>
          <Group>
            {user.PaymentMethods?.map((method) => {
              const { icon: Icon, label } = getPaymentMethodInfo(method.MethodType);
              return (
                <Tooltip
                  key={method.UserPaymentMethodId}
                  label={method.IsActive ? method.Identifier : 'Payment method inactive'}
                >
                  <Stack align='center' gap='xs'>
                    <ActionIcon
                      variant='light'
                      size='xl'
                      color={method.IsActive ? 'blue' : 'gray'}
                      onClick={() => method.IsActive && handlePayment(method)}
                      style={{
                        opacity: method.IsActive ? 1 : 0.5,
                        cursor: method.IsActive ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <div style={{ width: 24, height: 24, display: 'flex' }}>
                        <Icon />
                      </div>
                    </ActionIcon>
                    <Text size='xs' c={method.IsActive ? 'inherit' : 'dimmed'}>
                      {label}
                    </Text>
                  </Stack>
                </Tooltip>
              );
            })}
          </Group>

          <Text size='xs' c='dimmed' mt='md'>
            Click a payment method to pay {user.FirstName}. For Zelle and Bitcoin, the address will
            be copied to your clipboard.
          </Text>
        </Stack>
      </Modal>
    </>
  );
};
