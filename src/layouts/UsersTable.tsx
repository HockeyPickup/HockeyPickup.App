import styles from '@/App.module.css';
import { EmailList } from '@/components/EmailList';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { User } from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { GET_USERS } from '@/lib/queries';
import { useQuery } from '@apollo/client';
import { Avatar, Paper, Table, Text } from '@mantine/core';
import { JSX, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AvatarService } from '../services/avatar';

const UsersTableComponent = ({
  users,
  avatars,
}: {
  users: User[];
  avatars: Record<string, string>;
}): JSX.Element => (
  <div style={{ overflowX: 'auto', width: '100%' }}>
    <Table striped highlightOnHover className={styles.usersTable} mb='xl'>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>&nbsp;</Table.Th>
          <Table.Th>Name</Table.Th>
          <Table.Th>Email</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {users.map((user: User) => (
          <Table.Tr key={user.Id}>
            <Table.Td>
              <Link to={`/profile/${user.Id}`}>
                <Avatar
                  src={avatars[user.Id]}
                  alt={`${user.FirstName} ${user.LastName}`}
                  radius='xl'
                  size={36}
                />
              </Link>
            </Table.Td>
            <Table.Td>
              {`${user.FirstName} ${user.LastName}`}
              {user.JerseyNumber !== 0 && ` #${user.JerseyNumber}`}
            </Table.Td>
            <Table.Td>{user.Email}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  </div>
);

export const UsersTable = (): JSX.Element => {
  const { loading, error, data } = useQuery(GET_USERS);
  const [avatars, setAvatars] = useState<Record<string, string>>({});
  const { isAdmin } = useAuth();

  useEffect(() => {
    const loadAvatars = async (): Promise<void> => {
      const newAvatars: Record<string, string> = {};
      for (const user of data?.UsersEx ?? []) {
        const avatarUrl = await AvatarService.getAvatarUrl(user.PhotoUrl);
        newAvatars[user.Id] = avatarUrl;
      }
      setAvatars(newAvatars);
    };
    if (data?.UsersEx) {
      loadAvatars();
    }
  }, [data]);

  if (loading) return <LoadingSpinner />;
  if (error) return <Text c='red'>Error: {error.message}</Text>;

  const activeUsers = data?.UsersEx.filter((user: User) => user.Active) ?? [];
  const inactiveUsers = data?.UsersEx.filter((user: User) => !user.Active) ?? [];

  const getAllEmails = (users: User[]): string => {
    return users.map((user: User) => user.Email).join('\n');
  };

  return (
    <Paper shadow='sm' p='md'>
      <Text ta='left' mt='xs' mb='xs'>
        {activeUsers.length} Active Players
      </Text>
      <UsersTableComponent users={activeUsers} avatars={avatars} />
      {isAdmin() && (
        <>
          <EmailList getEmails={() => getAllEmails(activeUsers)} />
          <Text ta='left' mt='xs' mb='xs'>
            {inactiveUsers.length} Inactive Players
          </Text>
          <UsersTableComponent users={inactiveUsers} avatars={avatars} />
        </>
      )}
    </Paper>
  );
};
