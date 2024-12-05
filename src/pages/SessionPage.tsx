import { SessionTable } from '@/layouts/SessionTable';
import { useTitle } from '@/layouts/TitleContext';
import { Container } from '@mantine/core';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export const SessionPage = (): JSX.Element => {
  const { sessionId } = useParams();
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle('Session Detail');
  }, [setTitle]);

  return (
    <Container size='xl'>
      <SessionTable sessionId={parseInt(sessionId ?? '0')} />
    </Container>
  );
};
