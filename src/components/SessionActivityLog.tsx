import styles from '@/App.module.css';
import { ActivityLogResponse, SessionDetailedResponse } from '@/HockeyPickup.Api';
import { Paper, Table, Title } from '@mantine/core';
import moment from 'moment';
import { JSX } from 'react';

interface SessionActivityLogProps {
  session: SessionDetailedResponse;
}

export const SessionActivityLog = ({ session }: SessionActivityLogProps): JSX.Element => {
  return (
    <Paper shadow='sm' p='md'>
      <Title order={3} mb='md'>
        Activity Log
      </Title>
      <Table striped className={styles.table}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>User</Table.Th>
            <Table.Th>Activity</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {session.ActivityLogs?.map((log: ActivityLogResponse) => (
            <Table.Tr key={log.ActivityLogId}>
              <Table.Td>
                {moment.utc(log.CreateDateTime).local().format('MM/DD/yyyy, HH:mm:ss.SSS')}
              </Table.Td>
              <Table.Td>{log.User?.FirstName + ' ' + log.User?.LastName || '-'}</Table.Td>
              <Table.Td>{log.Activity}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
};
