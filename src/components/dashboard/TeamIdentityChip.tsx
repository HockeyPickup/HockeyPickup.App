import { TeamAssignment } from '@/HockeyPickup.Api';
import { getTeamIdentity } from '@/lib/dashboard';
import { Group, Image, Text } from '@mantine/core';
import { JSX } from 'react';

interface TeamIdentityChipProps {
  team: TeamAssignment | undefined;
  /** `full` leads with "You're on"; `compact` is the badge used in dense lists. */
  variant?: 'full' | 'compact';
}

/**
 * Team as identity, not as a data field. The light team reads light and the dark team reads dark,
 * so which bench you're on is legible before the words are.
 */
export const TeamIdentityChip = ({ team, variant = 'full' }: TeamIdentityChipProps): JSX.Element => {
  const identity = getTeamIdentity(team);
  const compact = variant === 'compact';

  return (
    <Group
      gap={compact ? 6 : 'sm'}
      wrap='nowrap'
      style={{
        background: identity.background,
        border: `1px solid ${identity.borderColor}`,
        borderRadius: 'var(--mantine-radius-md)',
        padding: compact ? '3px 10px 3px 4px' : '8px 16px 8px 8px',
        width: 'fit-content',
      }}
    >
      <Image
        src={identity.logo}
        alt={identity.name}
        w={compact ? 22 : 40}
        h={compact ? 22 : 40}
        fit='contain'
        radius='sm'
      />
      {compact ? (
        <Text size='sm' fw={600} c={identity.textColor}>
          {identity.name}
        </Text>
      ) : (
        <Text size='xl' fw={700} c={identity.textColor}>
          You&apos;re on {identity.name}
        </Text>
      )}
    </Group>
  );
};
