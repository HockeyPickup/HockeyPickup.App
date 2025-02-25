/* eslint-disable react/no-unescaped-entities */
import { Blockquote, Container, Stack, Text, Title } from '@mantine/core';
import { JSX, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTitle } from '../layouts/TitleContext';

export const AboutPage = (): JSX.Element => {
  const { setPageInfo } = useTitle();

  useEffect(() => {
    setPageInfo('About', 'About Hockey Pickup');
  }, [setPageInfo]);

  return (
    <Container size='md' py='sm' ml='sm' mr='sm' mb='sm'>
      <Stack gap='md'>
        <Title order={1}>About John Bryan Hockey Pickup</Title>
        <Text>
          <p>
            <img src='/static/toyota_ice.jpg' width='250' alt='Toyota Sports Performance Center' />
          </p>
          <Blockquote
            color='green'
            iconSize={30}
            mt='md'
            mb='md'
            styles={{ root: { fontSize: '1.2rem' } }}
          >
            "JB hockey pickup, a twice weekly skate widely considered one of the best pickup hockey
            groups in North America"
            <br />
            <br />
            <Text size='sm'>
              Source:&nbsp;
              <a href='https://www.nhl.com/news/la-strong-game-full-circle-moment-for-first-responder-roger-sackaroff'>
                nhl.com
              </a>
            </Text>
          </Blockquote>
          <p>
            Our founder, John Bryan, started this pickup skate in 2004 to enable novice skaters to
            improve their skills. 20+ years later, our pickup has become a lifestyle and we're still
            going strong. We play almost every Wednesday and Friday morning at our home ice at&nbsp;
            <a href='https://www.toyotasportsperformancecenter.com/'>
              Toyota Sports Performance Center
            </a>
            &nbsp;in El Segundo, California, USA.
          </p>
          <p>The mission since founding was, and still is:</p>
          <Blockquote
            color='blue'
            iconSize={30}
            mt='md'
            mb='md'
            styles={{ root: { fontSize: '1.2rem' } }}
          >
            To provide a safe skate for pickup hockey where players can improve their skills and
            have fun together.
          </Blockquote>
          <p>
            This portal is brought to you with ❤️ by&nbsp;
            <a href='https://brettmorrison.com'>Brett Morrison</a>.
          </p>
          <p>
            The source code for this project is on&nbsp;
            <a href='https://github.com/HockeyPickup'>GitHub</a> as Open Source, MIT license.
          </p>
          <p>
            For feedback, feature requests, or bug reports, please leave them&nbsp;
            <a href='https://github.com/HockeyPickup/HockeyPickup.App/issues'>here</a>.
          </p>
          <p>See you on the ice. Enjoy, and long may you glide...</p>
        </Text>
      </Stack>
      <Link to='/version'>Version Info</Link>
    </Container>
  );
};
