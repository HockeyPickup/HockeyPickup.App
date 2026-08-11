import { BuySellResponse } from '@/HockeyPickup.Api';
import { bySessionDateDesc } from '@/lib/payments';
import { DashboardBuySell } from '@/types/graphql';
import { Alert, Anchor, Badge, Group, Stack, Text } from '@mantine/core';
import { IconCash, IconCreditCardPay } from '@tabler/icons-react';
import moment from 'moment';
import { JSX } from 'react';
import { Link } from 'react-router-dom';

interface ActionRequiredProps {
  unpaidBuys: BuySellResponse[];
  unconfirmedSells: BuySellResponse[];
  /** Counterparty lookup, keyed by BuySellId — the current-user payload omits Buyer/Seller. */
  buySellsById: Map<number, DashboardBuySell>;
}

const formatMoney = (price: number): string => `$${price.toFixed(2)}`;

const counterpartyName = (
  buySell: DashboardBuySell | undefined,
  side: 'Buyer' | 'Seller',
): string | null => {
  const person = side === 'Buyer' ? buySell?.Buyer : buySell?.Seller;
  if (!person) return null;
  return [person.FirstName, person.LastName].filter(Boolean).join(' ');
};

interface ActionItemProps {
  transaction: BuySellResponse;
  icon: JSX.Element;
  headline: string;
  cta: string;
}

const ActionItem = ({ transaction, icon, headline, cta }: ActionItemProps): JSX.Element => (
  <Alert
    color='yellow'
    variant='light'
    radius='md'
    icon={icon}
    styles={{ root: { borderLeft: '4px solid var(--mantine-color-yellow-6)' } }}
  >
    <Group justify='space-between' align='center' wrap='wrap' gap='xs'>
      <Stack gap={2} style={{ minWidth: 0 }}>
        <Text size='sm' fw={600}>
          {headline}
        </Text>
        <Text size='xs' c='dimmed'>
          {moment.utc(transaction.SessionDate).format('dddd, MMMM Do, YYYY')}
        </Text>
      </Stack>
      <Group gap='sm' wrap='nowrap'>
        <Badge color='yellow' variant='filled' radius='sm'>
          {formatMoney(transaction.Price)}
        </Badge>
        <Anchor component={Link} to={`/session/${transaction.SessionId}`} size='sm' fw={600}>
          {cta}
        </Anchor>
      </Group>
    </Group>
  </Alert>
);

/**
 * The highest-priority zone: money the player owes, and money owed to them that they have not
 * acknowledged. Renders nothing at all when both are empty — an empty "Action Required" heading
 * is worse than no heading.
 *
 * Same source of truth as the global banner in MainLayout (lib/payments), so the two can never
 * disagree about what is outstanding.
 */
export const ActionRequired = ({
  unpaidBuys,
  unconfirmedSells,
  buySellsById,
}: ActionRequiredProps): JSX.Element | null => {
  if (unpaidBuys.length === 0 && unconfirmedSells.length === 0) return null;

  return (
    <Stack gap='sm'>
      <Group gap='xs' align='center'>
        <Text size='1.35rem' fw={700}>
          Action Required
        </Text>
        <Badge color='yellow' variant='filled' radius='sm'>
          {unpaidBuys.length + unconfirmedSells.length}
        </Badge>
      </Group>

      {[...unpaidBuys].sort(bySessionDateDesc).map((transaction) => {
        const seller = counterpartyName(buySellsById.get(transaction.BuySellId), 'Seller');
        return (
          <ActionItem
            key={`buy-${transaction.BuySellId}`}
            transaction={transaction}
            icon={<IconCreditCardPay size={18} />}
            headline={
              seller
                ? `Payment due to ${seller} for the spot you bought`
                : 'Payment due for the spot you bought'
            }
            cta='Pay now'
          />
        );
      })}

      {[...unconfirmedSells].sort(bySessionDateDesc).map((transaction) => {
        const buyer = counterpartyName(buySellsById.get(transaction.BuySellId), 'Buyer');
        return (
          <ActionItem
            key={`sell-${transaction.BuySellId}`}
            transaction={transaction}
            icon={<IconCash size={18} />}
            headline={
              buyer
                ? `Confirm payment from ${buyer} for the spot you sold`
                : 'Confirm payment for the spot you sold'
            }
            cta='Mark received'
          />
        );
      })}
    </Stack>
  );
};
