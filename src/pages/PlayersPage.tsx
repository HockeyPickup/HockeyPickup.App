import { useTitle } from '@/layouts/TitleContext';
import { UsersTable } from '@/layouts/UsersTable';
import { Container } from '@mantine/core';
import { JSX, useEffect } from 'react';

export const PlayersPage = (): JSX.Element => {
  const { setTitle } = useTitle();
  useEffect(() => {
    setTitle('Players');
  }, [setTitle]);

  return (
    <Container size='xl'>
      <UsersTable />
    </Container>
  );
};
