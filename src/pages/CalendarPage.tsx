/* eslint-disable react/no-unescaped-entities */
import { useAuth } from '@/lib/auth';
import { getCalendarUrl, rebuildCalendar } from '@/lib/calendar';
import { Button, Container, Group, Text, Title } from '@mantine/core';
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

  const inputStyle = {
    width: '80%',
    marginBottom: '10px',
    padding: '5px',
  };

  return (
    <Container size='md' py='xs'>
      <Group justify='space-between' align='center'>
        <Title>Calendar</Title>
        <img src='/static/calendar.png' alt='Calendar' width={48} height={48} />
      </Group>{' '}
      <h2>Syncing Pickup Sessions to your Calendar</h2>
      <h4>
        Sessions will be synced with your calendar on mobile and desktop, and will automatically be
        added / updated when you subscribe.
      </h4>
      <h3>Google Calendar:</h3>
      <ol>
        <li>Open your Gmail account and go to Google Calendar.</li>
        <li>
          On the left side of the screen, find "Other calendars" and click the plus (+) icon next to
          it.
        </li>
        <li>Select "From URL" from the drop-down menu.</li>
        <li>In the "URL of calendar" field, paste the following URL:</li>
      </ol>
      <input type='text' id='gmailLink' value={calendarUrl} readOnly style={inputStyle} />
      <button onClick={() => copyToClipboard('gmailLink')}>Copy URL</button>
      <p>Click / Tap "Add Calendar" to add the subscription..</p>
      <h3>Apple Calendar:</h3>
      <h4>Automatic</h4>
      <a href={calendarUrl.replace(/^(http|https):\/\//, 'webcal://')}>Tap Here</a>
      <h4>Manual</h4>
      <ol>
        <li>Open Apple Calendar on your device.</li>
        <li>Go to "File" &gt; "Add Calendar / New Calendar Subscription."</li>
        <li>In the "Calendar URL" field, paste the following URL:</li>
      </ol>
      <input type='text' id='appleLink' value={calendarUrl} readOnly style={inputStyle} />
      <button onClick={() => copyToClipboard('gmailLink')}>Copy URL</button>
      <p>Click / Tap "Subscribe" to add the subscription.</p>
      <h3>Outlook Calendar:</h3>
      <ol>
        <li>Open Outlook and go to the Calendar view.</li>
        <li>In the ribbon at the top, click "Add Calendar" &gt; "From Internet."</li>
        <li>In the "Link to the calendar" field, paste the following URL:</li>
      </ol>
      <input type='text' id='outlookLink' value={calendarUrl} readOnly style={inputStyle} />
      <button onClick={() => copyToClipboard('gmailLink')}>Copy URL</button>
      <p>Click / Tap "OK" to add the subscription.</p>
      {isAdmin() && (
        <Group mt='xl' mb='xl'>
          <Button onClick={handleRebuildCalendar} color='blue'>
            Regenerate Calendar
          </Button>
          {rebuildMessage && (
            <Text c={rebuildMessage.includes('success') ? 'green' : 'red'}>{rebuildMessage}</Text>
          )}
        </Group>
      )}
    </Container>
  );
};
