import {
  PaymentMethodType,
  UserDetailedResponse,
  UserPaymentMethodResponse,
} from '@/HockeyPickup.Api';
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
  [PaymentMethodType.PayPal]: { icon: FaPaypal, label: 'PayPal' },
  [PaymentMethodType.Venmo]: { icon: SiVenmo, label: 'Venmo' },
  [PaymentMethodType.CashApp]: { icon: SiCashapp, label: 'Cash App' },
  [PaymentMethodType.Zelle]: { icon: BsCreditCard2Front, label: 'Zelle' },
  [PaymentMethodType.Bitcoin]: { icon: FaBitcoin, label: 'Bitcoin' },
};

const getPaymentUrl = (
  method: UserPaymentMethodResponse,
  amount: number,
  description: string,
): string => {
  const encodedDesc = encodeURIComponent(description);

  switch (method.MethodType) {
    case PaymentMethodType.Venmo:
      return `https://venmo.com/${method.Identifier}?txn=pay&note=${encodedDesc}&amount=${amount}`;
    case PaymentMethodType.CashApp:
      return `https://cash.app/$${method.Identifier}/${amount}?note=${encodedDesc}`;
    case PaymentMethodType.PayPal:
      return `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${method.Identifier}&amount=${amount}&item_name=${encodedDesc}&currency_code=USD`;
    case PaymentMethodType.Zelle:
      return method.Identifier;
    case PaymentMethodType.Bitcoin:
      return method.Identifier;
    default:
      return '';
  }
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

    if (
      method.MethodType === PaymentMethodType.Zelle ||
      method.MethodType === PaymentMethodType.Bitcoin
    ) {
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
        title={<Title order={3}>Pay {user.FirstName}</Title>}
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
            Payment Methods (in order of preference)
          </Title>
          <Group>
            {user.PaymentMethods?.map((method) => {
              const { icon: Icon, label } = PAYMENT_METHODS[method.MethodType];
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
                      <Icon size={24} />
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
