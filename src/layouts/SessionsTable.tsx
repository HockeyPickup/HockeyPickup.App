/* eslint-disable no-unused-vars */
import styles from '@/App.module.css';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Session } from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { GET_SESSIONS } from '@/lib/queries';
import { useQuery } from '@apollo/client';
import { Paper, Table, Text } from '@mantine/core';
import moment from 'moment-timezone';
import { JSX, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export enum SessionDisplay {
  All = 'All',
  Future = 'Future',
  Past = 'Past',
}

export const SessionsTable = ({ display }: { display: SessionDisplay }): JSX.Element => {
  const { loading, error, data, refetch } = useQuery(GET_SESSIONS, {
    fetchPolicy: 'network-only',
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  // Add effect to refetch when component mounts/remounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading) return <LoadingSpinner />;
  if (error) return <Text c='red'>Error: {error.message}</Text>;

  // Add filtering and sorting logic
  const filteredSessions = data?.Sessions.filter((session: Session) => {
    // SessionDate is already PST, so just create moment without timezone conversion
    const sessionDate = moment(session.SessionDate);
    // Create current time in PST
    const now = moment.tz('America/Los_Angeles');

    switch (display) {
      case SessionDisplay.Future:
        return sessionDate.isAfter(now);
      case SessionDisplay.Past:
        return sessionDate.isBefore(now);
      default:
        return true;
    }
  }).sort((a: Session, b: Session) => {
    const multiplier = display === SessionDisplay.Future ? 1 : -1;

    return multiplier * (moment(a.SessionDate).valueOf() - moment(b.SessionDate).valueOf());
  });

  return (
    <Paper shadow='sm' p='md'>
      <Table striped highlightOnHover className={styles.table}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Session Date</Table.Th>
            <Table.Th>Note</Table.Th>
            <Table.Th>Buy Window</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredSessions.map((session: Session) => (
            <Table.Tr
              key={session.SessionId}
              onClick={() => navigate(`/session/${session.SessionId}`)}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6E3CBC')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              <Table.Td>
                {moment.utc(session.SessionDate).format('dddd, MM/DD/yyyy, HH:mm')}
              </Table.Td>
              <Table.Td>{session.Note ?? ''}</Table.Td>
              <Table.Td>
                {moment
                  .utc(session.SessionDate)
                  .subtract(
                    user?.PreferredPlus
                      ? session.BuyDayMinimum
                      : user?.Preferred
                        ? session.BuyDayMinimum
                        : (session.BuyDayMinimum ?? 6) - 1,
                    'days',
                  )
                  .subtract(22, 'hours')
                  .subtract(user?.PreferredPlus ? (session.BuyDayMinimum ?? 6) - 1 : 0, 'minutes')
                  .format('dddd, MM/DD/yyyy, HH:mm')}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
};
