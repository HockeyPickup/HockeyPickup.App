import { LoadingSpinner } from '@/components/LoadingSpinner';
import { User } from '@/HockeyPickup.Api';
import { useTitle } from '@/layouts/TitleContext';
import { GET_USERS } from '@/lib/queries';
import { useQuery } from '@apollo/client';
import { Avatar, Container, Paper, Table, Text } from '@mantine/core';
import { JSX, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AvatarService } from '../services/avatar';

const GoalieTableComponent = ({
  goalies,
  avatars,
}: {
  goalies: User[];
  avatars: Record<string, string>;
}): JSX.Element => (
  <Table striped highlightOnHover mb='xl'>
    <Table.Tbody>
      {Array.from({ length: Math.ceil(goalies.length / 2) }, (_, rowIndex) => (
        <Table.Tr key={rowIndex}>
          {goalies.slice(rowIndex * 2, rowIndex * 2 + 2).map((goalie: User) => (
            <Table.Td key={goalie.Id} style={{ width: '50%' }}>
              <Link
                to={`/profile/${goalie.Id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    alignItems: 'center', // This centers the children horizontally
                  }}
                >
                  <Avatar
                    src={avatars[goalie.Id]}
                    alt={`${goalie.FirstName} ${goalie.LastName}`}
                    radius='xl'
                    size={96}
                  />
                  <Text size='lg'>{`${goalie.FirstName} ${goalie.LastName}`}</Text>
                </div>
              </Link>
            </Table.Td>
          ))}
          {rowIndex * 2 + 1 >= goalies.length && <Table.Td style={{ width: '50%' }} />}
        </Table.Tr>
      ))}
    </Table.Tbody>
  </Table>
);

export const GoalieLoungePage = (): JSX.Element => {
  const { setPageInfo } = useTitle();
  const { loading, error, data } = useQuery(GET_USERS);
  const [avatars, setAvatars] = useState<Record<string, string>>({});

  useEffect(() => {
    setPageInfo('Goalie Lounge');
  }, [setPageInfo]);

  useEffect(() => {
    const loadAvatars = async (): Promise<void> => {
      const newAvatars: Record<string, string> = {};
      for (const user of data?.UsersEx || []) {
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

  const goalies =
    data?.UsersEx.filter(
      (user: User) => user.Active && user.PositionPreference.toString() === 'GOALIE',
    ) || [];
  return (
    <Container size='xl' mb='lg'>
      <Paper shadow='sm' p='md'>
        <Text size='xl' fw={500} mb='md'>
          Active Goalies ({goalies.length})
        </Text>
        <GoalieTableComponent goalies={goalies} avatars={avatars} />
      </Paper>
    </Container>
  );
};
