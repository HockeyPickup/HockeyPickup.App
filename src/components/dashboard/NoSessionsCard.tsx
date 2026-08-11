import { Button, Card, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCalendarOff } from '@tabler/icons-react';
import { JSX } from 'react';
import { Link } from 'react-router-dom';

/**
 * Nothing on the calendar. Rare, but the off-season and the gap between schedules both hit it,
 * and a blank page reads as a broken one.
 */
export const NoSessionsCard = (): JSX.Element => (
  <Card radius='md' p='xl' withBorder bg='dark.6'>
    <Stack align='center' gap='sm'>
      <ThemeIcon color='gray' variant='light' radius='xl' size={56}>
        <IconCalendarOff size={28} />
      </ThemeIcon>
      <Text size='lg' fw={600}>
        No sessions scheduled yet
      </Text>
      <Text size='sm' c='dimmed' ta='center' maw={420}>
        Once the next skate is on the calendar it&apos;ll show up right here, with your team and
        position.
      </Text>
      <Button component={Link} to='/sessions' variant='light' mt='xs'>
        Browse all sessions
      </Button>
    </Stack>
  </Card>
);
