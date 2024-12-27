import { LoadingSpinner } from '@/components/LoadingSpinner';
import { RegularSetSelect } from '@/components/RegularSetSelect';
import {
  CreateSessionRequest,
  ErrorDetail,
  SessionDetailedResponse,
  UpdateSessionRequest,
} from '@/HockeyPickup.Api';
import { useTitle } from '@/layouts/TitleContext';
import { GET_SESSION } from '@/lib/queries';
import { sessionService } from '@/lib/session';
import { isApiErrorResponse } from '@/services/api-helpers';
import { useQuery } from '@apollo/client';
import {
  Button,
  Container,
  Group,
  NumberInput,
  Paper,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCalendar, IconCash, IconClock, IconNotes } from '@tabler/icons-react';
import { JSX, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface SessionFormValues extends Omit<CreateSessionRequest, 'SessionDate' | 'RegularSetId'> {
  SessionDate: Date;
  RegularSetId: string;
}

const getDefaultDateTime = (): Date => {
  // Create a date string in PST
  const pstDate = new Date().toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
  });
  const date = new Date(pstDate);
  date.setHours(7, 30, 0, 0);
  return date;
};

const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
};

const parseDateFromApi = (isoString: string): Date => {
  // Remove any timezone indicator to prevent conversion
  const localString = isoString.replace('Z', '');

  const [datePart, timePart] = localString.split('T');
  const [year, month, day] = datePart.split('-');
  const [hours, minutes, seconds] = timePart.split(':');

  const date = new Date();
  date.setFullYear(parseInt(year));
  date.setMonth(parseInt(month) - 1);
  date.setDate(parseInt(day));
  date.setHours(parseInt(hours));
  date.setMinutes(parseInt(minutes));
  date.setSeconds(parseFloat(seconds));

  return date;
};

export const SessionFormPage = (): JSX.Element => {
  const { setTitle } = useTitle();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<ErrorDetail[]>([]);

  const isEditMode = !!sessionId;

  const { loading: sessionLoading, data: sessionData } = useQuery(GET_SESSION, {
    variables: { SessionId: parseInt(sessionId ?? '0') },
    skip: !isEditMode,
    fetchPolicy: 'network-only',
  });

  const form = useForm<SessionFormValues>({
    initialValues: {
      SessionDate: getDefaultDateTime(),
      Note: '',
      RegularSetId: '0',
      BuyDayMinimum: 6,
      Cost: 27,
    },
    validate: {
      SessionDate: (value: Date | null) => (!value ? 'Session date is required' : null),
      RegularSetId: (value: string) => (value === '0' ? 'Regular set is required' : null),
      BuyDayMinimum: (value: number | undefined) =>
        !value || value < 0 || value > 365 ? 'Buy day minimum must be between 0 and 365' : null,
      Cost: (value: number | undefined) =>
        !value || value < 0 || value > 1000 ? 'Cost must be between $0 and $1000' : null,
    },
  });

  // Populate form when session data is loaded
  useEffect(() => {
    if (sessionData?.Session && isEditMode) {
      const session: SessionDetailedResponse = sessionData.Session;

      const formValues = {
        SessionDate: parseDateFromApi(session.SessionDate),
        Note: session.Note ?? '',
        RegularSetId: session.RegularSetId?.toString() ?? '0', // Convert to string
        BuyDayMinimum: session.BuyDayMinimum ?? 6,
        Cost: session.Cost ?? 27,
      };

      // Only update if values are different
      if (JSON.stringify(form.values) !== JSON.stringify(formValues)) {
        form.setValues(formValues);
      }
    }
  }, [sessionData]);

  useEffect(() => {
    setTitle(isEditMode ? 'Edit Session' : 'Create Session');
  }, [setTitle, isEditMode]);

  if (isEditMode && sessionLoading) {
    return <LoadingSpinner />;
  }

  const handleSubmit = async (values: SessionFormValues): Promise<void> => {
    setIsLoading(true);
    setApiErrors([]);

    try {
      const payload: UpdateSessionRequest | CreateSessionRequest = {
        ...values,
        RegularSetId: parseInt(values.RegularSetId),
        SessionDate: formatDateForApi(values.SessionDate),
      };
      console.debug(payload);

      var response;
      if (isEditMode) {
        response = await sessionService.updateSession({
          ...payload,
          SessionId: parseInt(sessionId!),
        });
      } else {
        response = await sessionService.createSession(payload);
      }
      if (response.Success) {
        notifications.show({
          position: 'top-center',
          autoClose: 5000,
          style: { marginTop: '60px' },
          title: 'Success',
          message: `Session ${isEditMode ? 'updated' : 'created'} successfully`,
          color: 'green',
        });
        navigate('/sessions', { state: { refresh: true } });
      } else if (response.Errors) {
        setApiErrors(response.Errors);
      }
    } catch (error: unknown) {
      console.error('Session operation failed:', error);
      if (isApiErrorResponse(error)) {
        setApiErrors(error.response.data.Errors);
      } else {
        setApiErrors([{ Message: 'Failed to save session. Please try again.' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size='sm' px='lg'>
      <Paper withBorder shadow='md' p={30} radius='md'>
        <Title order={2} mb='xl'>
          {isEditMode ? 'Edit Session' : 'Create Session'}
        </Title>

        <form onSubmit={form.onSubmit((values) => handleSubmit(values as SessionFormValues))}>
          <Stack>
            <DateTimePicker
              label='Session Date and Time (PST)'
              placeholder='Pick date and time'
              leftSection={<IconCalendar size={16} />}
              required
              clearable={false}
              valueFormat='MM/DD/YYYY HH:mm'
              timeInputProps={{ type: '24' }}
              withSeconds={false}
              {...form.getInputProps('SessionDate')}
            />
            <RegularSetSelect
              value={form.values.RegularSetId}
              onChange={(value) => form.setFieldValue('RegularSetId', value ?? '')}
              defaultIncludeArchived={false}
            />{' '}
            <NumberInput
              label='Buy Day Minimum'
              placeholder='Enter minimum days before buying'
              leftSection={<IconClock size={16} />}
              required
              min={0}
              max={365}
              {...form.getInputProps('BuyDayMinimum')}
            />
            <NumberInput
              label='Cost'
              placeholder='Enter session cost'
              leftSection={<IconCash size={16} />}
              min={0}
              max={1000}
              decimalScale={2}
              required
              prefix='$'
              {...form.getInputProps('Cost')}
            />
            <Textarea
              label='Notes'
              placeholder='Enter notes'
              leftSection={<IconNotes size={16} />}
              minRows={3}
              autosize
              maxRows={6}
              {...form.getInputProps('Note')}
            />
            {apiErrors.length > 0 && (
              <Stack gap='xs'>
                {apiErrors.map((error, index) => (
                  <Text key={index} c='red' size='sm'>
                    {error.Message}
                  </Text>
                ))}
              </Stack>
            )}
            <Group justify='flex-end' mt='xl'>
              <Button variant='light' onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type='submit' loading={isLoading}>
                {isEditMode ? 'Update Session' : 'Create Session'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};
