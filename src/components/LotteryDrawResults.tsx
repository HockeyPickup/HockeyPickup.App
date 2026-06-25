import { SessionDetailedResponse } from '@/HockeyPickup.Api';
import { DrawnClass, getDrawnClasses, LOTTERY_CLASS_LABELS } from '@/lib/lottery';
import {
  ActionIcon,
  Box,
  Button,
  Collapse,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconPlayerPlay, IconTrophy } from '@tabler/icons-react';
import { JSX, useState } from 'react';
import { EntrantAvatar } from './LotteryEntrantAvatar';
import { LotteryDrawRevealModal } from './LotteryDrawReveal';

interface LotteryDrawResultsProps {
  session: SessionDetailedResponse;
}

// Permanent, always-visible "done & closed" view of each drawn tier's pick order. Collapsed by
// default; click the header to expand. Each tier can replay its draw animation on demand.
export const LotteryDrawResults = ({ session }: LotteryDrawResultsProps): JSX.Element | null => {
  const [opened, setOpened] = useState<boolean>(false);
  const [replay, setReplay] = useState<DrawnClass | null>(null);
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
          style={{ flexShrink: 0 }}
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
              <Group justify='space-between' wrap='nowrap' mb='xs' gap='xs'>
                <Text size='xs' c='dimmed' tt='uppercase' fw={600} style={{ minWidth: 0 }}>
                  {LOTTERY_CLASS_LABELS[dc.lotteryClass]} · draw order
                </Text>
                <Tooltip label='Replay draw' withArrow>
                  <ActionIcon
                    variant='subtle'
                    color='gray'
                    size='sm'
                    style={{ flexShrink: 0 }}
                    aria-label={`Replay ${LOTTERY_CLASS_LABELS[dc.lotteryClass]} draw`}
                    onClick={(): void => setReplay(dc)}
                  >
                    <IconPlayerPlay size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
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
      <LotteryDrawRevealModal drawnClass={replay} onClose={(): void => setReplay(null)} />
    </Paper>
  );
};
