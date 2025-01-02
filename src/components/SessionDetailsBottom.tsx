import { SessionDetailedResponse } from '@/HockeyPickup.Api';
import { Group, Paper, Text } from '@mantine/core';
import moment from 'moment';
import { JSX } from 'react';

interface SessionDetailsProps {
  session: SessionDetailedResponse;
}

export const SessionDetailsBottom = ({ session }: SessionDetailsProps): JSX.Element => {
  return (
    <Paper shadow='sm'>
      <Group>
        <Text size='sm' fw={700} w={130} ta='right'>
          Session Created:
        </Text>
        <Text>{moment.utc(session.CreateDateTime).local().format('MM/DD/yyyy, HH:mm')}</Text>
      </Group>
      <Group>
        <Text size='sm' fw={700} w={130} ta='right'>
          Session Updated:
        </Text>
        <Text>{moment.utc(session.UpdateDateTime).local().format('MM/DD/yyyy, HH:mm')}</Text>
      </Group>
      <Group>
        <Text size='sm' fw={700} w={130} ta='right'>
          Cost:
        </Text>
        <Text>${session.Cost ?? ''}</Text>
      </Group>
    </Paper>
  );
};
