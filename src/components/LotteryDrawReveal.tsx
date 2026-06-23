import { LotteryEntrantResponse, SessionDetailedResponse } from '@/HockeyPickup.Api';
import {
  DrawnClass,
  getDrawnClasses,
  LOTTERY_CLASS_LABELS,
  revealStorageKey,
  shuffle,
} from '@/lib/lottery';
import { Badge, Button, Group, Modal, Stack, Text, Title } from '@mantine/core';
import { JSX, useEffect, useState } from 'react';
import { EntrantAvatar } from './LotteryDrawResults';

interface LotteryDrawRevealProps {
  session: SessionDetailedResponse;
}

// The shuffle decelerates as it lands: each frame's delay grows, so names cycle fast at first
// then slow to a readable stop (~3.7s total) before settling on the real order.
const SHUFFLE_FRAMES = 20;
const frameDelayMs = (frame: number): number => 80 + frame * frame * 0.9;

// A one-time, NBA-draft-style reveal of a completed lottery tier's pick order. Names+avatars
// shuffle/blur, then settle into the real draw order. Fires from the live socket push or on page
// load (covering a missed/timed-out socket), and only once per user per draw (localStorage).
export const LotteryDrawReveal = ({ session }: LotteryDrawRevealProps): JSX.Element => {
  const [current, setCurrent] = useState<DrawnClass | null>(null);
  const [settled, setSettled] = useState<boolean>(false);
  const [displayEntrants, setDisplayEntrants] = useState<LotteryEntrantResponse[]>([]);

  // Pick the next unseen, recent, completed draw to reveal — one tier at a time.
  useEffect(() => {
    if (current) return;
    const next = getDrawnClasses(session.LotteryEntrants).find(
      (dc) => !localStorage.getItem(revealStorageKey(session.SessionId, dc.lotteryClass, dc.drawDateTime)),
    );
    if (!next) return;

    // Mark seen immediately so it never replays, even if closed mid-animation.
    localStorage.setItem(revealStorageKey(session.SessionId, next.lotteryClass, next.drawDateTime), '1');
    setSettled(false);
    setDisplayEntrants(next.entrants);
    setCurrent(next);
  }, [session, current]);

  // Run the shuffle frames, then settle into the real order.
  useEffect(() => {
    if (!current) return undefined;
    const real = current.entrants;
    if (real.length <= 1) {
      setDisplayEntrants(real);
      setSettled(true);
      return undefined;
    }

    let frame = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = (): void => {
      frame += 1;
      if (frame >= SHUFFLE_FRAMES) {
        setDisplayEntrants(real);
        setSettled(true);
        return;
      }
      setDisplayEntrants(shuffle(real));
      timer = setTimeout(tick, frameDelayMs(frame));
    };
    timer = setTimeout(tick, frameDelayMs(0));

    return (): void => clearTimeout(timer);
  }, [current]);

  const handleClose = (): void => {
    setCurrent(null);
    setSettled(false);
  };

  if (!current) return <></>;

  return (
    <Modal
      opened
      onClose={handleClose}
      centered
      withCloseButton={settled}
      closeOnClickOutside={settled}
      closeOnEscape={settled}
      size='md'
      title={
        <Stack gap={0}>
          <Text size='xs' c='dimmed' tt='uppercase' fw={600}>
            {LOTTERY_CLASS_LABELS[current.lotteryClass]} lottery
          </Text>
          <Title order={3}>{settled ? 'Draw Results' : 'Drawing…'}</Title>
        </Stack>
      }
    >
      <Stack gap='md'>
        <div
          style={{
            filter: settled ? 'none' : 'blur(3px)',
            opacity: settled ? 1 : 0.85,
            transition: 'filter 350ms ease, opacity 350ms ease',
          }}
        >
          <Stack gap='xs'>
            {displayEntrants.map((entrant, index) => (
              <Group key={entrant.LotteryEntrantId} gap='sm' wrap='nowrap'>
                <Text size='sm' w={24} ta='right' c='dimmed'>
                  {settled ? `${entrant.DrawOrder}.` : '•'}
                </Text>
                <EntrantAvatar entrant={entrant} size={36} />
                <Text size='sm' fw={settled && index === 0 ? 700 : 400}>
                  {entrant.FirstName} {entrant.LastName}
                </Text>
              </Group>
            ))}
          </Stack>
        </div>

        {settled && (
          <Group justify='space-between' mt='xs'>
            <Badge color='gray' variant='light'>
              Closed
            </Badge>
            <Button onClick={handleClose}>Done</Button>
          </Group>
        )}
      </Stack>
    </Modal>
  );
};
