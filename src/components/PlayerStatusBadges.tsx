import { PositionPreference, UserDetailedResponse } from '@/HockeyPickup.Api';
import { Button, Group } from '@mantine/core';
import { JSX } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * The player's standing chips — Active, Preferred, Preferred+, Locker Room 13.
 *
 * Extracted from the Profile header so the dashboard hero reads identically rather than
 * re-implementing the same pill styling. Profile-only chips (Game Pucks, Videos, Email) stay on
 * the Profile page; this is the subset that describes *status*.
 */

const CHIP_ROOT = { paddingLeft: 14, paddingRight: 14, height: 22 } as const;

/** Disabled chips are labels, not controls: Mantine dims them, so the colours are restated. */
const staticChipStyles = (color: string): { root: Record<string, string | number> } => ({
  root: {
    ...CHIP_ROOT,
    cursor: 'default',
    backgroundColor: `var(--mantine-color-${color}-filled)`,
    color: 'var(--mantine-color-white)',
  },
});

interface PlayerStatusBadgesProps {
  user: Pick<
    UserDetailedResponse,
    'Active' | 'Preferred' | 'PreferredPlus' | 'LockerRoom13' | 'PositionPreference'
  >;
  /** Opt-in so the Profile header, which already states position in its info card, is unchanged. */
  showPosition?: boolean;
}

export const PlayerStatusBadges = ({
  user,
  showPosition = false,
}: PlayerStatusBadgesProps): JSX.Element => {
  const navigate = useNavigate();

  return (
    <Group gap={5}>
      {showPosition && user.PositionPreference === PositionPreference.Goalie && (
        <Button disabled size='xs' radius='xl' color='teal' styles={staticChipStyles('teal')}>
          GOALIE
        </Button>
      )}
      {user.Active ? (
        <Button disabled size='xs' radius='xl' color='green' styles={staticChipStyles('green')}>
          ACTIVE
        </Button>
      ) : (
        <Button disabled size='xs' radius='xl' color='red' styles={staticChipStyles('red')}>
          INACTIVE
        </Button>
      )}
      {user.Preferred && (
        <Button disabled size='xs' radius='xl' color='blue' styles={staticChipStyles('blue')}>
          PREFERRED
        </Button>
      )}
      {user.PreferredPlus && (
        <Button disabled size='xs' radius='xl' color='violet' styles={staticChipStyles('violet')}>
          PREFERRED+
        </Button>
      )}
      {user.LockerRoom13 && (
        <Button
          size='xs'
          radius='xl'
          color='yellow'
          styles={{ root: { ...CHIP_ROOT } }}
          onClick={() => navigate('/lockerroom13')}
        >
          LR13
        </Button>
      )}
    </Group>
  );
};
