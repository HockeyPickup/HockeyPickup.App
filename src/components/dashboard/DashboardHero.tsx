import { PlayerStatusBadges } from '@/components/PlayerStatusBadges';
import { UserDetailedResponse } from '@/HockeyPickup.Api';
import { AvatarService } from '@/services/avatar';
import { Avatar, Card, Group, Image, Stack, Text, Title } from '@mantine/core';
import { JSX, useEffect, useState } from 'react';

interface DashboardHeroProps {
  user: UserDetailedResponse;
}

/**
 * Compact, personal header. The club logo stays present but small — above the fold now belongs to
 * the player, not the brand, so the mission statement no longer lives here (it remains on /about).
 */
export const DashboardHero = ({ user }: DashboardHeroProps): JSX.Element => {
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    const loadAvatar = async (): Promise<void> => {
      setAvatarUrl(await AvatarService.getAvatarUrl(user.PhotoUrl ?? ''));
    };
    loadAvatar();
  }, [user.PhotoUrl]);

  return (
    <Card
      shadow='sm'
      p='lg'
      radius='md'
      withBorder
      style={{
        background:
          'linear-gradient(45deg, var(--mantine-color-dark-7), var(--mantine-color-dark-6))',
        border: '1px solid var(--mantine-color-dark-4)',
      }}
    >
      <Group justify='space-between' wrap='nowrap' align='center'>
        <Group gap='md' wrap='nowrap' style={{ minWidth: 0 }}>
          <Avatar src={avatarUrl} size={64} radius='xl' alt={user.FirstName ?? 'Player'} />
          <Stack gap={6} style={{ minWidth: 0 }}>
            <Group gap='xs' align='baseline' wrap='nowrap'>
              <Title order={3} style={{ lineHeight: 1.2 }}>
                Welcome back, {user.FirstName}
              </Title>
              {user.JerseyNumber !== 0 && (
                <Text c='dimmed' fw={500} size='lg'>
                  #{user.JerseyNumber}
                </Text>
              )}
            </Group>
            <PlayerStatusBadges user={user} showPosition />
          </Stack>
        </Group>
        <Image
          src='/static/JB_Puck_Logo.png'
          alt='Hockey Pickup'
          w={56}
          h={56}
          fit='contain'
          visibleFrom='sm'
        />
      </Group>
    </Card>
  );
};
