import { LotteryClass, LotteryEntrantResponse, SessionDetailedResponse } from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import {
  DrawnClass,
  getDrawnClasses,
  LOTTERY_CLASS_LABELS,
  revealStorageKey,
  shuffle,
} from '@/lib/lottery';
import { Badge, Button, Group, Modal, Stack, Text, Title } from '@mantine/core';
import { JSX, useEffect, useState } from 'react';
import { EntrantAvatar } from './LotteryEntrantAvatar';

// The shuffle decelerates as it lands: each frame's delay grows, so names cycle fast at first
// then slow to a readable stop (~3.7s total) before settling on the real order.
const SHUFFLE_FRAMES = 20;
const frameDelayMs = (frame: number): number => 80 + frame * frame * 0.9;

interface LotteryDrawRevealModalProps {
  drawnClass: DrawnClass | null;
  onClose: () => void;
}

// The animated, NBA-draft-style modal: names+avatars shuffle/blur, then settle into the real draw
// order. Shared by the one-time auto-reveal and the on-demand replay in the results panel. Pass a
// DrawnClass to play; pass null to keep it closed.
export const LotteryDrawRevealModal = ({
  drawnClass,
  onClose,
}: LotteryDrawRevealModalProps): JSX.Element => {
  const [settled, setSettled] = useState<boolean>(false);
  const [displayEntrants, setDisplayEntrants] = useState<LotteryEntrantResponse[]>([]);

  // Run the shuffle frames whenever a draw is opened, then settle into the real order. Resetting on
  // close keeps a re-open (e.g. a second replay) from flashing the previous settled state.
  useEffect(() => {
    if (!drawnClass) {
      setSettled(false);
      return undefined;
    }
    const real = drawnClass.entrants;
    setSettled(false);
    setDisplayEntrants(real);
    if (real.length <= 1) {
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
  }, [drawnClass]);

  if (!drawnClass) return <></>;

  return (
    <Modal
      opened
      onClose={onClose}
      centered
      withCloseButton={settled}
      closeOnClickOutside={settled}
      closeOnEscape={settled}
      size='md'
      radius='lg'
      classNames={{ content: 'lottery-reveal-modal' }}
      title={
        <Stack gap={0}>
          <Text size='xs' c='dimmed' tt='uppercase' fw={600}>
            {LOTTERY_CLASS_LABELS[drawnClass.lotteryClass]} lottery
          </Text>
          <Title order={3}>{settled ? 'Draw Results' : 'Drawing Replay'}</Title>
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
            <Button onClick={onClose}>Done</Button>
          </Group>
        )}
      </Stack>
    </Modal>
  );
};

interface LotteryDrawRevealProps {
  session: SessionDetailedResponse;
  isSessionFuture: boolean;
}

// A one-time, NBA-draft-style reveal of the viewing user's lottery tier pick order. Fires from the
// live socket push or on page load (covering a missed/timed-out socket), and only once per user per
// draw (localStorage). Replays from the results panel are on-demand and not gated by localStorage.
export const LotteryDrawReveal = ({
  session,
  isSessionFuture,
}: LotteryDrawRevealProps): JSX.Element => {
  const { user } = useAuth();
  const [current, setCurrent] = useState<DrawnClass | null>(null);

  // Reveal only the draw for the viewer's own tier — and only for upcoming sessions (lotteries
  // draw within ~a week of the session, so a past session's draw is old news, not a reveal).
  useEffect(() => {
    if (current || !isSessionFuture || !user) return;

    const userTier: LotteryClass = user.PreferredPlus
      ? LotteryClass.PreferredPlus
      : user.Preferred
        ? LotteryClass.Preferred
        : LotteryClass.Standard;

    const next = getDrawnClasses(session.LotteryEntrants).find(
      (dc) => dc.lotteryClass === userTier,
    );
    if (!next) return;

    const key = revealStorageKey(session.SessionId, next.lotteryClass, next.drawDateTime);
    if (localStorage.getItem(key)) return;

    // Mark seen immediately so it never replays, even if closed mid-animation.
    localStorage.setItem(key, '1');
    setCurrent(next);
  }, [session, current, isSessionFuture, user]);

  return <LotteryDrawRevealModal drawnClass={current} onClose={(): void => setCurrent(null)} />;
};
