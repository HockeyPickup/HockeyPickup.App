import { useTitle } from '@/layouts/TitleContext';
import { Container, Text } from '@mantine/core';
import { JSX, useEffect } from 'react';

export const GoalieLoungePage = (): JSX.Element => {
  const { setTitle } = useTitle();
  useEffect(() => {
    setTitle('Goalie Lounge');
  }, [setTitle]);
  return (
    <Container>
      <Text>Goalie Lounge page content</Text>
    </Container>
  );
};
