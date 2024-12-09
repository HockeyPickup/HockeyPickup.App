import styles from '@/App.module.css';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { User } from '@/HockeyPickup.Api';
import { GET_USERS } from '@/lib/queries';
import { useQuery } from '@apollo/client';
import { Paper, Table, Text } from '@mantine/core';
import { JSX } from 'react';

const formatNotificationPreference = (pref: string): string => {
  switch (pref) {
    case 'NONE':
      return 'None';
    case 'ALL':
      return 'All Notifications';
    case 'ONLY_MY_BUY_SELL':
      return 'Only My Buy/Sell';
    default:
      return 'Unknown';
  }
};

export const UsersTable = (): JSX.Element => {
  const { loading, error, data } = useQuery(GET_USERS);

  if (loading) return <LoadingSpinner />;
  if (error) return <Text c='red'>Error: {error.message}</Text>;

  return (
    <Paper shadow='sm' p='md'>
      <Table striped highlightOnHover className={styles.table}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>PayPal Email</Table.Th>
            <Table.Th>Venmo Account</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Notifications</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data?.UsersEx.map((user: User) => (
            <Table.Tr key={user.Id}>
              <Table.Td>{`${user.FirstName} ${user.LastName}`}</Table.Td>
              <Table.Td>{user.Email}</Table.Td>
              <Table.Td>{user.PayPalEmail}</Table.Td>
              <Table.Td>{user.VenmoAccount}</Table.Td>
              <Table.Td>
                {user.PreferredPlus ? 'Preferred+' : user.Preferred ? 'Preferred' : 'Standard'}
              </Table.Td>
              <Table.Td>
                {formatNotificationPreference(user.NotificationPreference.toString())}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
};
