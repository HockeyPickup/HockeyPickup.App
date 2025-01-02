import { useTitle } from '@/layouts/TitleContext';
import { UsersTable } from '@/layouts/UsersTable';
import { Container } from '@mantine/core';
import { JSX, useEffect } from 'react';

export const PlayersPage = (): JSX.Element => {
  const { setPageInfo } = useTitle();
  useEffect(() => {
    setPageInfo('Players', 'Hockey Pickup Players');
  }, [setPageInfo]);

  return (
    <Container size='xl' mb='lg'>
      <UsersTable />
    </Container>
  );
};
