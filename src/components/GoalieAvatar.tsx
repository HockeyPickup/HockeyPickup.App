import { SessionGoalie } from '@/HockeyPickup.Api';
import { goalieName } from '@/lib/goalies';
import { AvatarService } from '@/services/avatar';
import { Avatar, Group, Text } from '@mantine/core';
import { JSX, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface GoalieAvatarProps {
  goalie: Pick<SessionGoalie, 'FirstName' | 'LastName' | 'PhotoUrl'>;
  size?: number;
}

// Circular profile avatar that resolves the photo url (with default fallback) the same way the
// roster does.
export const GoalieAvatar = ({ goalie, size = 24 }: GoalieAvatarProps): JSX.Element => {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    AvatarService.getAvatarUrl(goalie.PhotoUrl ?? '').then((resolved) => {
      if (active) setUrl(resolved);
    });
    return (): void => {
      active = false;
    };
  }, [goalie.PhotoUrl]);

  return <Avatar src={url} alt={goalieName(goalie)} radius='xl' size={size} />;
};

interface GoalieNamesProps {
  goalies: SessionGoalie[];
  size?: 'xs' | 'sm' | 'md';
  avatarSize?: number;
}

/** Avatar + name for each goalie, each linking to their profile. No team, no rating. */
export const GoalieNames = ({ goalies, size = 'xs', avatarSize = 20 }: GoalieNamesProps): JSX.Element => (
  <Group gap='sm' wrap='wrap'>
    {goalies.map((goalie) => (
      <Link
        key={goalie.UserId}
        to={`/profile/${goalie.UserId}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <Group gap={6} wrap='nowrap'>
          <GoalieAvatar goalie={goalie} size={avatarSize} />
          <Text size={size}>{goalieName(goalie)}</Text>
        </Group>
      </Link>
    ))}
  </Group>
);
