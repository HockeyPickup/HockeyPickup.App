import { useTitle } from '@/layouts/TitleContext';
import { Container, Text } from '@mantine/core';
import { JSX, useEffect } from 'react';

export const GoalieLoungePage = (): JSX.Element => {
  const { setPageInfo } = useTitle();
  useEffect(() => {
    setPageInfo('Goalie Lounge');
  }, [setPageInfo]);
  return (
    <Container size='xl' mb='lg'>
      <Text>Goalie Lounge - Coming Soon</Text>
    </Container>
  );
};
