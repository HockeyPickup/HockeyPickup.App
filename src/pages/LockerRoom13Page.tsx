import { LockerRoom13Table } from '@/layouts/LockerRoom13Table';
import { useTitle } from '@/layouts/TitleContext';
import { Container } from '@mantine/core';
import { JSX, useEffect } from 'react';

export const LockerRoom13Page = (): JSX.Element => {
  const { setPageInfo } = useTitle();
  useEffect(() => {
    setPageInfo('Locker Room 13');
  }, [setPageInfo]);

  return (
    <Container size='xl' mb='lg'>
      <p style={{ textAlign: 'center' }}>
        <img src='/static/lr13.jpg' width='360' alt='Locker Room 13' />
      </p>
      <LockerRoom13Table />
    </Container>
  );
};
