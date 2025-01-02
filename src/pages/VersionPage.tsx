import { useTitle } from '@/layouts/TitleContext';
import versionJson from '@/version.json';
import { Container, Group, ScrollArea, Stack, Text } from '@mantine/core';
import { FC, useEffect } from 'react';
import ReactJson from 'react-json-view';

export const VersionPage: FC = () => {
  const { setPageInfo } = useTitle();
  useEffect(() => {
    setPageInfo('Version');
  }, [setPageInfo]);
  return (
    <Container size='xs' px='xs' mb='xl'>
      <Group mt='md' mb='xs'>
        <Stack>
          <Text size='lg'>Version Info:</Text>
          <ScrollArea>
            <ReactJson src={versionJson} name='VersionData' collapsed={false} theme='monokai' />
          </ScrollArea>
        </Stack>
      </Group>
    </Container>
  );
};
