import { LotteryEntrantResponse, SessionDetailedResponse } from '@/HockeyPickup.Api';
import { getDrawnClasses, LOTTERY_CLASS_LABELS } from '@/lib/lottery';
import { Avatar, Badge, Collapse, Group, Paper, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { JSX, useEffect, useState } from 'react';
import { AvatarService } from '@/services/avatar';

interface EntrantAvatarProps {
  entrant: LotteryEntrantResponse;
  size?: number;
}

// Circular profile avatar that resolves the photo url (with default fallback) the same way the
// roster does. Used everywhere an entrant name is shown.
export const EntrantAvatar = ({ entrant, size = 32 }: EntrantAvatarProps): JSX.Element => {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    AvatarService.getAvatarUrl(entrant.PhotoUrl ?? '').then((resolved) => {
      if (active) setUrl(resolved);
    });
    return (): void => {
      active = false;
    };
  }, [entrant.PhotoUrl]);

  return (
    <Avatar src={url} alt={`${entrant.FirstName} ${entrant.LastName}`} radius='xl' size={size} />
  );
};

interface LotteryDrawResultsProps {
  session: SessionDetailedResponse;
}

// Permanent, always-visible "done & closed" view of each drawn tier's pick order. Collapsed by
// default; click the header to expand.
export const LotteryDrawResults = ({ session }: LotteryDrawResultsProps): JSX.Element | null => {
  const [opened, setOpened] = useState<boolean>(false);
  const drawnClasses = getDrawnClasses(session.LotteryEntrants);
  if (drawnClasses.length === 0) return null;

  return (
    <Paper shadow='sm' p='md'>
      <UnstyledButton onClick={(): void => setOpened((v) => !v)} style={{ width: '100%' }}>
        <Group justify='space-between'>
          <Group gap='sm'>
            <Title order={3}>Lottery Results</Title>
            <Badge color='gray' variant='light'>
              Closed
            </Badge>
          </Group>
          {opened ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
        </Group>
      </UnstyledButton>
      <Collapse expanded={opened}>
        <Stack gap='lg' mt='md'>
          {drawnClasses.map((dc) => (
            <div key={dc.lotteryClass}>
              <Text size='xs' c='dimmed' tt='uppercase' fw={600} mb='xs'>
                {LOTTERY_CLASS_LABELS[dc.lotteryClass]} · draw order
              </Text>
              <Stack gap='xs'>
                {dc.entrants.map((entrant) => (
                  <Group key={entrant.LotteryEntrantId} gap='sm' wrap='nowrap'>
                    <Text size='sm' w={24} ta='right' c='dimmed'>
                      {entrant.DrawOrder}.
                    </Text>
                    <EntrantAvatar entrant={entrant} size={32} />
                    <Text size='sm'>
                      {entrant.FirstName} {entrant.LastName}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </div>
          ))}
        </Stack>
      </Collapse>
    </Paper>
  );
};
