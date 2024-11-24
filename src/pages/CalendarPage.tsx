/* eslint-disable react/no-unescaped-entities */
import { Container, Group, Title } from '@mantine/core';
import { useEffect } from 'react';
import { useTitle } from '../layouts/TitleContext';

export const CalendarPage = (): JSX.Element => {
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle('Calendar');
  }, [setTitle]);

  const copyToClipboard = async (inputId: string): Promise<void> => {
    try {
      const input = document.getElementById(inputId) as HTMLInputElement;
      await navigator.clipboard.writeText(input.value);
      alert('Calendar subscription link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const inputStyle = {
    width: '80%',
    marginBottom: '10px',
    padding: '5px',
  };

  return (
    <Container size='md' py='xl'>
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
      <input
        type='text'
        id='gmailLink'
        value='https://hockeypickup.com/hockey_pickup.ics'
        readOnly
        style={inputStyle}
      />
      <button onClick={() => copyToClipboard('gmailLink')}>Copy URL</button>
      <p>Click / Tap "Add Calendar" to add the subscription..</p>
      <h3>Apple Calendar:</h3>
      <h4>Automatic</h4>
      <a href='webcal://hockeypickup.com/hockey_pickup.ics'>Tap Here</a>
      <h4>Manual</h4>
      <ol>
        <li>Open Apple Calendar on your device.</li>
        <li>Go to "File" &gt; "Add Calendar / New Calendar Subscription."</li>
        <li>In the "Calendar URL" field, paste the following URL:</li>
      </ol>
      <input
        type='text'
        id='appleLink'
        value='https://hockeypickup.com/hockey_pickup.ics'
        readOnly
        style={inputStyle}
      />
      <button onClick={() => copyToClipboard('gmailLink')}>Copy URL</button>
      <p>Click / Tap "Subscribe" to add the subscription.</p>
      <h3>Outlook Calendar:</h3>
      <ol>
        <li>Open Outlook and go to the Calendar view.</li>
        <li>In the ribbon at the top, click "Add Calendar" &gt; "From Internet."</li>
        <li>In the "Link to the calendar" field, paste the following URL:</li>
      </ol>
      <input
        type='text'
        id='outlookLink'
        value='https://hockeypickup.com/hockey_pickup.ics'
        readOnly
        style={inputStyle}
      />
      <button onClick={() => copyToClipboard('gmailLink')}>Copy URL</button>
      <p>Click / Tap "OK" to add the subscription.</p>
    </Container>
  );
};
