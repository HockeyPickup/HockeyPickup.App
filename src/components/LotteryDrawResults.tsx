import { LotteryEntrantResponse, SessionDetailedResponse } from '@/HockeyPickup.Api';
import { getDrawnClasses, LOTTERY_CLASS_LABELS } from '@/lib/lottery';
import { Avatar, Box, Button, Collapse, Group, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconTrophy } from '@tabler/icons-react';
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
    <Paper withBorder p='md' mt='md' bg='rgba(255, 255, 255, 0.05)'>
      <Group justify='space-between' wrap='nowrap' gap='sm' mb={opened ? 'md' : 0}>
        <Group gap='sm' align='center' wrap='nowrap' style={{ minWidth: 0 }}>
          <ThemeIcon color='purple' variant='light' radius='md' size='lg'>
            <IconTrophy size={20} />
          </ThemeIcon>
          <Box style={{ minWidth: 0 }}>
            <Title order={5} style={{ lineHeight: 1.15 }}>
              Lottery Results
            </Title>
            <Text size='xs' c='dimmed' style={{ lineHeight: 1.25 }}>
              Closed · final pick order
            </Text>
          </Box>
        </Group>
        <Button
          variant='subtle'
          color='gray'
          size='compact-xs'
          onClick={(): void => setOpened((v) => !v)}
          leftSection={opened ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
        >
          {opened ? 'Hide' : 'Show'}
        </Button>
      </Group>
      <Collapse expanded={opened}>
        <Stack gap='lg'>
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
