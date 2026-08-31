import { Group, Stack, Text } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { JSX } from 'react';

/**
 * The rink address. Every session is played here, so the venue is a constant rather than
 * session data — extracted only so the session card and the dashboard spotlight cannot drift.
 */
const VENUE = {
  name: 'Toyota Sports Performance Center',
  street: '555 North Nash Street',
  cityStateZip: 'El Segundo, CA, 90245 USA',
  mapUrl: 'https://maps.app.goo.gl/z3t64RhrksDy16GN9',
} as const;

interface VenueLinkProps {
  size?: string;
  iconSize?: number;
}

export const VenueLink = ({ size = 'lg', iconSize = 24 }: VenueLinkProps): JSX.Element => (
  <a
    href={VENUE.mapUrl}
    target='_blank'
    rel='noopener noreferrer'
    style={{ textDecoration: 'none' }}
  >
    <Group gap='xs' wrap='nowrap' align='flex-start'>
      <IconMapPin size={iconSize} style={{ color: '#909296', flexShrink: 0 }} />
      <Stack gap={1}>
        <Text size={size} c='gray.4'>
          {VENUE.name}
        </Text>
        <Text size={size} c='gray.4'>
          {VENUE.street}
        </Text>
        <Text size={size} c='gray.4'>
          {VENUE.cityStateZip}
        </Text>
      </Stack>
    </Group>
  </a>
);
