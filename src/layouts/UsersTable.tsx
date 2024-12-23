import styles from '@/App.module.css';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { User } from '@/HockeyPickup.Api';
import { GET_USERS } from '@/lib/queries';
import { useQuery } from '@apollo/client';
import { Avatar, Paper, Table, Text } from '@mantine/core';
import { JSX, useEffect, useState } from 'react';
import { AvatarService } from '../services/avatar';

export const UsersTable = (): JSX.Element => {
  const { loading, error, data } = useQuery(GET_USERS);
  const [avatars, setAvatars] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadAvatars = async (): Promise<void> => {
      const newAvatars: Record<string, string> = {};
      for (const user of data?.UsersEx || []) {
        if (user.Email) {
          const avatarUrl = await AvatarService.getAvatarUrl(
            user.Email,
            `${user.FirstName} ${user.LastName}`,
            {
              size: 40,
              fallbackType: 'initials',
            },
          );
          newAvatars[user.Id] = avatarUrl;
        }
      }
      setAvatars(newAvatars);
    };
    if (data?.UsersEx) {
      loadAvatars();
    }
  }, [data]);

  if (loading) return <LoadingSpinner />;
  if (error) return <Text c='red'>Error: {error.message}</Text>;

  const activePlayersCount = data?.UsersEx.length || 0;

  return (
    <Paper shadow='sm' p='md'>
      <Text ta='left' mt='xs' mb='xs'>
        {activePlayersCount} Active Players
      </Text>
      <Table striped highlightOnHover className={styles.table} mb='xl'>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Avatar</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>PayPal Email</Table.Th>
            <Table.Th>Venmo Account</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data?.UsersEx.map((user: User) => (
            <Table.Tr key={user.Id}>
              <Table.Td>
                <Avatar
                  src={avatars[user.Id]}
                  alt={`${user.FirstName} ${user.LastName}`}
                  radius='xl'
                  size='md'
                />
              </Table.Td>
              <Table.Td>{`${user.FirstName} ${user.LastName}`}</Table.Td>
              <Table.Td>{user.Email}</Table.Td>
              <Table.Td>{user.PayPalEmail}</Table.Td>
              <Table.Td>{user.VenmoAccount}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
};
