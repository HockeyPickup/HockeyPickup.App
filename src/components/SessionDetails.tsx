import { SessionDetailedResponse } from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { ActionIcon, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import moment from 'moment';
import { JSX } from 'react';
import { useNavigate } from 'react-router-dom';

interface SessionDetailsProps {
  session: SessionDetailedResponse;
}

export const SessionDetails = ({ session }: SessionDetailsProps): JSX.Element => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <Paper shadow='sm' p='md'>
      <Group justify='space-between' mb='md'>
        <Group>
          <Title order={3}>
            {moment.utc(session.SessionDate).format('dddd, MM/DD/yyyy, HH:mm')}
          </Title>
          {isAdmin() && (
            <ActionIcon
              variant='subtle'
              onClick={() => navigate(`/sessions/${session.SessionId}/edit`)}
              size='sm'
            >
              <IconPencil size={16} />
            </ActionIcon>
          )}
        </Group>
      </Group>{' '}
      <Stack gap={2}>
        <Group>
          <Text>{session.Note ?? ''}</Text>
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
        <Group>
          <Text size='sm' fw={700} w={100} ta='right'>
            Cost:
          </Text>
          <Text>${session.Cost ?? ''}</Text>
        </Group>
      </Stack>
    </Paper>
  );
};
