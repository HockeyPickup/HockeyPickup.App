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
          <Text fw={700}>
            Buy Window
            {user?.PreferredPlus
              ? ' (Preferred Plus): '
              : user?.Preferred
                ? ' (Preferred): '
                : ': '}
            {moment
              .utc(
                user?.PreferredPlus
                  ? session.BuyWindowPreferredPlus
                  : user?.Preferred
                    ? session.BuyWindowPreferred
                    : session.BuyWindow,
              )
              .format('dddd, MM/DD/yyyy, HH:mm')}
          </Text>{' '}
        </Group>
      </Stack>
    </Paper>
  );
};
