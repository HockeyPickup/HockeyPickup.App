import { useZoom } from '@/hooks/useZoom';
import { SessionDisplay, SessionsTable } from '@/layouts/SessionsTable';
import { useTitle } from '@/layouts/TitleContext';
import { Container, Title } from '@mantine/core';
import { useEffect } from 'react';

export const SessionsPage = (): JSX.Element => {
  const { setTitle } = useTitle();
  useEffect(() => {
    setTitle('Sessions');
  }, [setTitle]);
  useZoom(true);

  return (
    <Container size='xl'>
      <Title order={2} mb='md'>
        Upcoming Sessions
      </Title>
      <SessionsTable display={SessionDisplay.Future} />
      <Title order={2} mt='xl' mb='md'>
        Past Sessions
      </Title>
      <SessionsTable display={SessionDisplay.Past} />
    </Container>
  );
};
