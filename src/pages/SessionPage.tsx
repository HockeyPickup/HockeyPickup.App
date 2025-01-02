import { SessionTable } from '@/layouts/SessionTable';
import { useTitle } from '@/layouts/TitleContext';
import { Container } from '@mantine/core';
import { JSX, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export const SessionPage = (): JSX.Element => {
  const { sessionId } = useParams();
  const { setPageInfo } = useTitle();

  useEffect(() => {
    setPageInfo(
      'Session Detail',
      sessionId ? `Hockey Pickup session ${sessionId}` : 'Hockey Pickup session',
    );
  }, [sessionId, setPageInfo]);
  return (
    <Container size='xl' mb='lg'>
      <SessionTable sessionId={parseInt(sessionId ?? '0')} />
    </Container>
  );
};
