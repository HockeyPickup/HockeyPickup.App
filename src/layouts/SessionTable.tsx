import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SessionActions } from '@/components/SessionActions';
import { SessionActivityLog } from '@/components/SessionActivityLog';
import { SessionBuyingQueue } from '@/components/SessionBuyingQueue';
import { SessionDetails } from '@/components/SessionDetails';
import { SessionDetailsBottom } from '@/components/SessionDetailsBottom';
import { SessionEmails } from '@/components/SessionEmails';
import { SessionRoster } from '@/components/SessionRoster';
import { SessionDetailedResponse } from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { GET_SESSION, SESSION_UPDATED } from '@/lib/queries';
import { SessionQueryResult } from '@/types/graphql';
import { useQuery, useSubscription } from '@apollo/client/react';
import { Stack, Text } from '@mantine/core';
import moment from 'moment';
import { JSX, useEffect, useState } from 'react';

interface SessionTableProps {
  sessionId: number;
}

interface SessionUpdatedSubscriptionResult {
  SessionUpdated: SessionDetailedResponse;
}

export const SessionTable = ({ sessionId }: SessionTableProps): JSX.Element => {
  const { loading, error, data } = useQuery<SessionQueryResult>(GET_SESSION, {
    variables: { SessionId: sessionId },
    fetchPolicy: 'network-only',
  });

  useSubscription<SessionUpdatedSubscriptionResult>(SESSION_UPDATED, {
    variables: { SessionId: sessionId },
    onData: ({ data }) => {
      console.debug('Session update received:', data?.data?.SessionUpdated);
      if (data?.data?.SessionUpdated) {
        setSession(data.data.SessionUpdated);
      }
    },
  });

  const [session, setSession] = useState<SessionDetailedResponse | null>(null);
  const { isAdmin } = useAuth();

  // Update session state when data changes
  useEffect(() => {
    if (data?.Session) {
      setSession(data.Session);
    }
  }, [data]);

  if (loading) return <LoadingSpinner />;
  if (error) return <Text c='red'>Error: {error.message}</Text>;
  if (!session) return <></>;
  console.info(session);

  const localString = session.SessionDate.replace('Z', '');
  const sessionDate = moment(localString);
  const now = moment.tz('America/Los_Angeles');
  const isSessionFuture: boolean = sessionDate.isAfter(now);

  return (
    <Stack>
      <SessionDetails session={session} />
      {isSessionFuture && <SessionActions session={session} onSessionUpdate={setSession} />}
      {session.RegularSetId && session.CurrentRosters && session.CurrentRosters.length > 0 && (
        <SessionRoster session={session} onSessionUpdate={setSession} />
      )}
      {session.BuyingQueues && session.BuyingQueues.length > 0 && (
        <SessionBuyingQueue session={session} onSessionUpdate={setSession} />
      )}
      {session.ActivityLogs && session.ActivityLogs.length > 0 && (
        <SessionActivityLog session={session} />
      )}
      <SessionDetailsBottom session={session} />
      {isAdmin() && session && <SessionEmails session={session} />}
    </Stack>
  );
};
