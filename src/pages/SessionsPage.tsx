import { useZoom } from '@/hooks/useZoom';
import { SessionDisplay, SessionsTable } from '@/layouts/SessionsTable';
import { useTitle } from '@/layouts/TitleContext';
import { useAuth } from '@/lib/auth';
import { Button, Container, Group, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { JSX, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const SessionsPage = (): JSX.Element => {
  const { setPageInfo } = useTitle();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.Roles?.includes('Admin') ?? false;

  useEffect(() => {
    setPageInfo('Sessions', 'Hockey Pickup Sessions');
  }, [setPageInfo]);

  useZoom(true);

  return (
    <Container size='xl' mb='lg'>
      <Group justify='space-between' mb='md'>
        <Title order={2}>Upcoming Sessions</Title>
        {isAdmin && (
          <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/sessions/new')}>
            New Session
          </Button>
        )}
      </Group>
      <SessionsTable display={SessionDisplay.Future} />
      <Title order={2} mt='xl' mb='md'>
        Past Sessions
      </Title>
      <SessionsTable display={SessionDisplay.Past} />
    </Container>
  );
};
