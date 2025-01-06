/* eslint-disable react/no-unescaped-entities */
import { useAuth } from '@/lib/auth';
import { getCalendarUrl, rebuildCalendar } from '@/lib/calendar';
import {
  Anchor,
  Button,
  Container,
  Group,
  List,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';
import { JSX, useEffect, useState } from 'react';
import { useTitle } from '../layouts/TitleContext';

export const CalendarPage = (): JSX.Element => {
  const { setPageInfo } = useTitle();
  const [calendarUrl, setCalendarUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [rebuildMessage, setRebuildMessage] = useState<string>('');
  const { isAdmin } = useAuth();

  const copyToClipboard = (elementId: string): void => {
    const element = document.getElementById(elementId) as HTMLInputElement;
    if (element) {
      element.select();
      navigator.clipboard.writeText(element.value);
    }
  };

  useEffect(() => {
    setPageInfo('Calendar', 'Hockey Pickup Calendar');

    const fetchCalendarUrl = async (): Promise<void> => {
      try {
        const response = await getCalendarUrl();
        setCalendarUrl(response.Data as string);
      } catch (err) {
        console.error('Failed to fetch calendar URL:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarUrl();
  }, [setPageInfo]);

  if (isLoading) {
    return (
      <Container size='md' py='xs'>
        <Text>Loading calendar information...</Text>
      </Container>
    );
  }

  const handleRebuildCalendar = async (): Promise<void> => {
    try {
      const response = await rebuildCalendar();
      console.info('Calendar rebuilt successfully:', response);
      setRebuildMessage('Calendar rebuilt successfully!');
    } catch (err) {
      console.error('Failed to rebuild calendar:', err);
      setRebuildMessage('Failed to rebuild calendar. Please try again.');
    }
  };

  return (
    <Container size='md' py='xs'>
      <Group justify='space-between' align='center' mb='md'>
        <Title order={1}>Calendar</Title>
        <img src='/static/calendar.png' alt='Calendar' width={48} height={48} />
      </Group>

      <Paper p='md' withBorder>
        <Stack>
          <Title order={2}>Syncing Pickup Sessions to your Calendar</Title>
          <Text size='lg'>
            Sessions will be synced with your calendar on mobile and desktop, and will automatically
            be added / updated when you subscribe.
          </Text>
          <Title order={3} mt='md'>
            Google Calendar:
          </Title>
          <List>
            <List.Item>Open your Gmail account and go to Google Calendar.</List.Item>
            <List.Item>
              On the left side of the screen, find "Other calendars" and click the plus (+) icon
              next to it.
            </List.Item>
            <List.Item>Select "From URL" from the drop-down menu.</List.Item>
            <List.Item>In the "URL of calendar" field, paste the following URL:</List.Item>
          </List>
          <Group>
            <TextInput
              id='gmailLink'
              value={calendarUrl}
              readOnly
              style={{ flex: 1 }}
              rightSection={
                <Button
                  variant='subtle'
                  size='compact-sm'
                  onClick={() => copyToClipboard('gmailLink')}
                  title='Copy URL'
                >
                  <IconCopy size={16} />
                </Button>
              }
            />
          </Group>
          <Text>Click / Tap "Add Calendar" to add the subscription.</Text>
          <Title order={3} mt='md'>
            Apple Calendar:
          </Title>
          <Title order={4}>Automatic</Title>
          <Anchor href={calendarUrl.replace(/^(http|https):\/\//, 'webcal://')}>Tap Here</Anchor>
          <Title order={4}>Manual</Title>
          <List>
            <List.Item>Open Apple Calendar on your device.</List.Item>
            <List.Item>Go to "File" &gt; "Add Calendar / New Calendar Subscription."</List.Item>
            <List.Item>In the "Calendar URL" field, paste the following URL:</List.Item>
          </List>
          <Group>
            <TextInput
              id='appleLink'
              value={calendarUrl}
              readOnly
              style={{ flex: 1 }}
              rightSection={
                <Button
                  variant='subtle'
                  size='compact-sm'
                  onClick={() => copyToClipboard('appleLink')}
                  title='Copy URL'
                >
                  <IconCopy size={16} />
                </Button>
              }
            />
          </Group>
          <Text>Click / Tap "Subscribe" to add the subscription.</Text>
          <Title order={3} mt='md'>
            Outlook Calendar:
          </Title>
          <List>
            <List.Item>Open Outlook and go to the Calendar view.</List.Item>
            <List.Item>
              In the ribbon at the top, click "Add Calendar" &gt; "From Internet."
            </List.Item>
            <List.Item>In the "Calendar URL" field, paste the following URL:</List.Item>
          </List>
          <Group>
            <TextInput
              id='outlookLink'
              value={calendarUrl}
              readOnly
              style={{ flex: 1 }}
              rightSection={
                <Button
                  variant='subtle'
                  size='compact-sm'
                  onClick={() => copyToClipboard('outlookLink')}
                  title='Copy URL'
                >
                  <IconCopy size={16} />
                </Button>
              }
            />
          </Group>
          <Text>Click / Tap "OK" to add the subscription.</Text>
        </Stack>
      </Paper>

      {isAdmin() && (
        <Paper withBorder p='md' mt='xl'>
          <Group>
            <Button onClick={handleRebuildCalendar} color='blue'>
              Regenerate Calendar
            </Button>
            {rebuildMessage && (
              <Text c={rebuildMessage.includes('success') ? 'green' : 'red'}>{rebuildMessage}</Text>
            )}
          </Group>
        </Paper>
      )}
    </Container>
  );
};
