import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/lib/auth';
import { getCalendarUrl, rebuildCalendar } from '@/lib/calendar';
import {
  ActionIcon,
  Alert,
  Button,
  Container,
  CopyButton,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconBrandApple,
  IconBrandGoogle,
  IconCalendarPlus,
  IconCheck,
  IconCopy,
  IconRefresh,
} from '@tabler/icons-react';
import { JSX, useEffect, useState } from 'react';
import { useTitle } from '../layouts/TitleContext';

const CALENDAR_NAME = 'Hockey Pickup';

interface SubscribeLink {
  label: string;
  href: string;
  icon: JSX.Element;
}

const buildSubscribeLinks = (url: string): SubscribeLink[] => {
  const webcalUrl = url.replace(/^https?:\/\//, 'webcal://');
  return [
    { label: 'Apple Calendar', href: webcalUrl, icon: <IconBrandApple size={18} /> },
    {
      label: 'Google Calendar',
      href: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`,
      icon: <IconBrandGoogle size={18} />,
    },
    {
      label: 'Outlook',
      href: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(url)}&name=${encodeURIComponent(CALENDAR_NAME)}`,
      icon: <IconCalendarPlus size={18} />,
    },
  ];
};

export const CalendarPage = (): JSX.Element => {
  const { setPageInfo } = useTitle();
  const { isAdmin } = useAuth();
  const [calendarUrl, setCalendarUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRebuilding, setIsRebuilding] = useState(false);

  useEffect(() => {
    setPageInfo('Calendar', 'Hockey Pickup Calendar');

    const fetchCalendarUrl = async (): Promise<void> => {
      try {
        const response = await getCalendarUrl();
        setCalendarUrl(response.Data ?? '');
      } catch (err) {
        console.error('Failed to fetch calendar URL:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarUrl();
  }, [setPageInfo]);

  const handleRebuildCalendar = async (): Promise<void> => {
    setIsRebuilding(true);
    try {
      await rebuildCalendar();
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Calendar Rebuilt',
        message: 'The calendar feed has been regenerated.',
        color: 'green',
      });
    } catch (err) {
      console.error('Failed to rebuild calendar:', err);
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Error',
        message: 'Failed to rebuild the calendar. Please try again.',
        color: 'red',
      });
    } finally {
      setIsRebuilding(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container size='sm' py='md'>
      <Stack gap='lg'>
        {calendarUrl ? (
          <Paper withBorder p='lg' radius='md'>
            <Stack gap='lg'>
              <div>
                <Title order={3}>Subscribe to Sessions</Title>
                <Text c='dimmed' size='sm' mt={4}>
                  Add the pickup schedule to your calendar once — new and changed sessions show up
                  automatically.
                </Text>
              </div>

              <SimpleGrid cols={{ base: 1, xs: 3 }} spacing='sm'>
                {buildSubscribeLinks(calendarUrl).map((link) => (
                  <Button
                    key={link.label}
                    component='a'
                    href={link.href}
                    target={link.href.startsWith('webcal:') ? undefined : '_blank'}
                    rel='noopener noreferrer'
                    variant='light'
                    leftSection={link.icon}
                  >
                    {link.label}
                  </Button>
                ))}
              </SimpleGrid>

              <TextInput
                label='Other apps'
                description='Copy this URL and add it as a calendar subscription.'
                value={calendarUrl}
                readOnly
                onFocus={(e) => e.currentTarget.select()}
                rightSection={
                  <CopyButton value={calendarUrl}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy URL'} withArrow>
                        <ActionIcon
                          variant='subtle'
                          color={copied ? 'teal' : 'gray'}
                          onClick={copy}
                          aria-label='Copy calendar URL'
                        >
                          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                }
              />
            </Stack>
          </Paper>
        ) : (
          <Alert color='red' icon={<IconAlertCircle size={18} />} title='Calendar unavailable'>
            We couldn&apos;t load the calendar link. Please refresh the page or try again later.
          </Alert>
        )}

        {isAdmin() && (
          <Paper withBorder p='md' radius='md'>
            <Stack gap='xs'>
              <Text fw={500}>Admin</Text>
              <Text c='dimmed' size='sm'>
                Regenerate the calendar feed from the current sessions.
              </Text>
              <Button
                variant='default'
                leftSection={<IconRefresh size={16} />}
                onClick={handleRebuildCalendar}
                loading={isRebuilding}
                w='fit-content'
              >
                Rebuild Calendar
              </Button>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
};
