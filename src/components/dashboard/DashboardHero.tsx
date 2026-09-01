import { PlayerStatusBadges } from '@/components/PlayerStatusBadges';
import { UserDetailedResponse } from '@/HockeyPickup.Api';
import { AvatarService } from '@/services/avatar';
import { Avatar, Card, Divider, Group, Image, Stack, Text, Title } from '@mantine/core';
import { JSX, useEffect, useState } from 'react';

interface DashboardHeroProps {
  user: UserDetailedResponse;
}

/**
 * Masthead plus personal greeting.
 *
 * The club's name leads — it is the masthead of the whole app and the signed-in page had lost it
 * to a 56px logo — but it shares one card with the player rather than taking a screen of its own,
 * so the session below still sits above the fold. The mission statement stays on /about.
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
          'linear-gradient(135deg, var(--mantine-color-dark-7) 0%, var(--mantine-color-dark-6) 55%, var(--mantine-color-dark-7) 100%)',
        border: '1px solid var(--mantine-color-dark-4)',
      }}
    >
      <Group gap='lg' wrap='nowrap' align='center'>
        <Image
          src='/static/JB_Puck_Logo.png'
          alt="John Bryan's Pickup Hockey"
          w={{ base: 56, sm: 76 }}
          h={{ base: 56, sm: 76 }}
          fit='contain'
          style={{ flexShrink: 0 }}
        />
        <Stack gap={2} style={{ minWidth: 0 }}>
          <Title
            order={1}
            style={{
              // Scales with the viewport so the name never wraps awkwardly on a phone.
              fontSize: 'clamp(1.25rem, 4.2vw, 2.1rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              fontWeight: 800,
            }}
          >
            John Bryan&apos;s Pickup Hockey
          </Title>
          <Text
            size='xs'
            c='dimmed'
            fw={600}
            style={{ letterSpacing: '0.22em', textTransform: 'uppercase' }}
          >
            Est. 2004 · El Segundo, CA
          </Text>
        </Stack>
      </Group>

      <Divider my='md' color='dark.4' />

      <Group gap='md' wrap='nowrap' align='center'>
        <Avatar src={avatarUrl} size={56} radius='xl' alt={user.FirstName ?? 'Player'} />
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
    </Card>
  );
};
