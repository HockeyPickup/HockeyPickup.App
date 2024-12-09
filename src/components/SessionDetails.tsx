import { SessionDetailedResponse } from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { Group, Paper, Stack, Text, Title } from '@mantine/core';
import moment from 'moment';

interface SessionDetailsProps {
  session: SessionDetailedResponse;
}

export const SessionDetails = ({ session }: SessionDetailsProps): JSX.Element => {
  const { user } = useAuth();

  return (
    <Paper shadow='sm' p='md'>
      <Title order={3} mb='md'>
        {moment.utc(session.SessionDate).format('dddd, MM/DD/yyyy, HH:mm')}
      </Title>
      <Stack gap='md'>
        <Group>
          <Text>{session.Note ?? '-'}</Text>
        </Group>
        <Group>
          <Text size='sm' fw={700} w={100} ta='right'>
            Buy Window:
          </Text>
          <Text>
            {moment
              .utc(session.SessionDate)
              .subtract(
                user?.PreferredPlus
                  ? session.BuyDayMinimum
                  : user?.Preferred
                    ? session.BuyDayMinimum
                    : (session.BuyDayMinimum ?? 6) - 1,
                'days',
              )
              .subtract(22, 'hours')
              .subtract(user?.PreferredPlus ? (session.BuyDayMinimum ?? 6) - 1 : 0, 'minutes')
              .format('dddd, MM/DD/yyyy, HH:mm')}
          </Text>
        </Group>
        <Group>
          <Text size='sm' fw={700} w={100} ta='right'>
            Created:
          </Text>
          <Text>{moment.utc(session.CreateDateTime).local().format('MM/DD/yyyy, HH:mm')}</Text>
        </Group>
        <Group>
          <Text size='sm' fw={700} w={100} ta='right'>
            Updated:
          </Text>
          <Text>{moment.utc(session.UpdateDateTime).local().format('MM/DD/yyyy, HH:mm')}</Text>
        </Group>
      </Stack>
    </Paper>
  );
};
