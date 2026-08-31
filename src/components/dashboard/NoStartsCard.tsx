import { Card, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconHandStop } from '@tabler/icons-react';
import { JSX } from 'react';

/**
 * A goalie with nothing booked.
 *
 * Deliberately not a call to action: goalies are invited to a net and accept or decline, so
 * there is nothing here for them to claim. The copy sets the right expectation instead.
 */
export const NoStartsCard = (): JSX.Element => (
  <Card radius='md' p='xl' withBorder bg='dark.6'>
    <Stack align='center' gap='sm'>
      <ThemeIcon color='teal' variant='light' radius='xl' size={56}>
        <IconHandStop size={28} />
      </ThemeIcon>
      <Text size='lg' fw={600}>
        No starts booked yet
      </Text>
      <Text size='sm' c='dimmed' ta='center' maw={440}>
        You&apos;ll hear from the commissioner when a net needs filling. Anything you accept shows
        up here with the date, the other goalie and a countdown.
      </Text>
    </Stack>
  </Card>
);
