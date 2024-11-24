/* eslint-disable react/no-unescaped-entities */
import { Container, Stack, Text, Title } from '@mantine/core';
import { useEffect } from 'react';
import { useTitle } from '../layouts/TitleContext';

export const AboutPage = (): JSX.Element => {
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle('About');
  }, [setTitle]);

  return (
    <Container size='md' py='xl'>
      <Stack gap='md'>
        <Title order={1}>About Hockey Pickup</Title>
        <Text>
          <p>
            <img src='/static/toyota_ice.jpg' width='250' alt='Toyota Sports Performance Center' />
          </p>
          <p>
            Our founder, John Bryan, started this pickup skate in 2004 to enable novice skaters to
            improve their skills. 20+ years later, our pickup has become a lifestyle and we're still
            going strong. We play almost every Wednesday and Friday morning at our home ice at{' '}
            <a href='https://www.toyotasportsperformancecenter.com/'>
              Toyota Sports Performance Center
            </a>{' '}
            in El Segundo, California, USA.
          </p>
          <p>
            This portal is brought to you with ❤️ by{' '}
            <a href='https://brettmorrison.com'>Brett Morrison</a>.
          </p>
          <p>
            The source code for this project is on{' '}
            <a href='https://github.com/HockeyPickup'>GitHub</a> as Open Source, MIT license.
          </p>
          <p>
            For feedback, feature requests, or bug reports, please leave them{' '}
            <a href='https://github.com/HockeyPickup/HockeyPickup.App/issues'>here</a>.
          </p>
          <p>See you on the ice. Enjoy, and long may you glide...</p>
        </Text>
      </Stack>
    </Container>
  );
};
