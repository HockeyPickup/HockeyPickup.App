import { Session } from '@/HockeyPickup.Api';
import { Button, Card, Group, Stack, Text } from '@mantine/core';
import { IconCalendar, IconClock, IconMapPin } from '@tabler/icons-react';
import moment from 'moment';
import { JSX } from 'react';
import { Link } from 'react-router-dom';

interface SessionCardProps {
  session: Session;
  image: string;
}

export const SessionCard = ({ session, image }: SessionCardProps): JSX.Element => {
  console.info(image);

  return (
    <Card
      w='100%'
      radius='lg'
      p='xl'
      bg='dark.6'
      style={{
        width: '1000px', // Fixed width on desktop
        '@media (max-width: 768px)': {
          width: '100%', // Responsive on mobile
        },
      }}
    >
      {' '}
      <Group
        gap='xl'
        style={{
          '@media (max-width: 768px)': {
            flexDirection: 'column',
          },
        }}
      >
        <Stack gap='lg' style={{ flex: 1, minWidth: '200px' }}>
          <Stack gap={1}>
            <Group gap='xs'>
              <IconCalendar size={24} style={{ color: '#909296' }} />
              <Text size='lg' c='gray.4' style={{ flex: 1 }}>
                {moment.utc(session.SessionDate).format('dddd, MMMM Do, YYYY')}
              </Text>
            </Group>
            <Group gap='xs'>
              <IconClock size={24} style={{ color: '#909296' }} />
              <Text size='lg' c='gray.4' style={{ flex: 1 }}>
                {moment.utc(session.SessionDate).format('h:mmA')} -{' '}
                {moment.utc(session.SessionDate).add(1, 'hour').format('h:mmA')}
              </Text>
            </Group>
          </Stack>

          <Text size='1.2rem' fw={700} c='white'>
            {session.Note}
          </Text>

          <a
            href='https://maps.app.goo.gl/z3t64RhrksDy16GN9'
            target='_blank'
            rel='noopener noreferrer'
            style={{ textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'none')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            <Group gap='xs'>
              <IconMapPin size={24} style={{ color: '#909296' }} />
              <Stack gap={1}>
                <Text size='lg' c='gray.4'>
                  Toyota Sports Performance Center
                </Text>
                <Text size='lg' c='gray.4'>
                  555 North Nash Street
                </Text>
                <Text size='lg' c='gray.4'>
                  El Segundo, CA, 90245 USA
                </Text>
              </Stack>
            </Group>
          </a>
          <Button
            component={Link}
            to={`/session/${session.SessionId}`}
            size='lg'
            radius='md'
            variant='outline'
            style={{
              width: '200px',
              borderColor: '#1864AB',
              color: '#339AF0',
              backgroundColor: 'rgba(24, 100, 171, 0.1)',
            }}
          >
            View Session
          </Button>
        </Stack>

        <img
          src={image}
          style={{
            width: '100%',
            maxWidth: '400px',
            height: '250px',
            objectFit: 'cover',
            borderRadius: 'var(--mantine-radius-md)',
          }}
          alt='Hockey players in action'
        />
      </Group>
    </Card>
  );
};
