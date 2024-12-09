import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SessionActivityLog } from '@/components/SessionActivityLog';
import { SessionBuyingQueue } from '@/components/SessionBuyingQueue';
import { SessionBuySells } from '@/components/SessionBuySells';
import { SessionDetails } from '@/components/SessionDetails';
import { SessionRoster } from '@/components/SessionRoster';
import { SessionDetailedResponse } from '@/HockeyPickup.Api';
import { GET_SESSION } from '@/lib/queries';
import { useQuery } from '@apollo/client';
import { Stack, Text } from '@mantine/core';
import { JSX, useEffect, useState } from 'react';

interface SessionTableProps {
  sessionId: number;
}

export const SessionTable = ({ sessionId }: SessionTableProps): JSX.Element => {
  const { loading, error, data } = useQuery(GET_SESSION, {
    variables: { SessionId: sessionId },
  });
  const [session, setSession] = useState<SessionDetailedResponse | null>(null);

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

  return (
    <Stack gap='md'>
      <SessionDetails session={session} />
      {session.RegularSetId && session.CurrentRosters && session.CurrentRosters.length > 0 && (
        <SessionRoster session={session} onSessionUpdate={setSession} />
      )}
      {session.BuyingQueues && session.BuyingQueues.length > 0 && (
        <SessionBuyingQueue session={session} />
      )}
      {session.ActivityLogs && session.ActivityLogs.length > 0 && (
        <SessionActivityLog session={session} />
      )}
      {session.BuySells && session.BuySells.length > 0 && <SessionBuySells session={session} />}
    </Stack>
  );
};
