import { PositionPreference, SessionDetailedResponse, SessionGoalie } from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { GOALIES_PER_SESSION, getSessionGoalies, goalieName, openNets } from '@/lib/goalies';
import { sessionService } from '@/lib/session';
import { ActionIcon, Badge, Button, Group, Paper, Stack, Text, Title, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash, IconUserQuestion } from '@tabler/icons-react';
import { JSX, useState } from 'react';
import { Link } from 'react-router-dom';
import { AddRosterPlayerModal } from './AddRosterPlayerModal';
import { GoalieAvatar } from './GoalieAvatar';

interface SessionGoaliesProps {
  session: SessionDetailedResponse;
  onSessionUpdate: (_session: SessionDetailedResponse) => void;
}

/**
 * The session's goalies, from the roster. No ratings and no team: goalies swap ends midway, so
 * they belong to neither side.
 */
export const SessionGoalies = ({ session, onSessionUpdate }: SessionGoaliesProps): JSX.Element => {
  const { isAdmin } = useAuth();
  const [addOpened, setAddOpened] = useState(false);
  const goalies = getSessionGoalies(session);
  const missing = openNets(session);

  const removeGoalie = async (goalie: SessionGoalie): Promise<void> => {
    try {
      const result = await sessionService.deleteFromRoster(session.SessionId, goalie.UserId);
      if (result.Data !== null && result.Data !== undefined) {
        onSessionUpdate(result.Data);
      }
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Goalie Removed',
        message: result.Message,
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to remove goalie:', error);
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Error',
        message:
          (error as { response?: { data: { Message: string } } }).response?.data?.Message ??
          'Failed to remove goalie from the roster',
        color: 'red',
      });
    }
  };

  const confirmRemove = (goalie: SessionGoalie): void => {
    modals.openConfirmModal({
      title: 'Remove goalie',
      centered: true,
      children: (
        <Text size='sm'>
          Remove {goalieName(goalie)} from this session&apos;s roster?
        </Text>
      ),
      labels: { confirm: 'Remove', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        void removeGoalie(goalie);
      },
    });
  };

  return (
    <Paper shadow='sm' p='md'>
      <Group justify='space-between' mb='md' wrap='wrap'>
        <Group gap='sm'>
          <Title order={3}>
            Goalies ({goalies.length} of {GOALIES_PER_SESSION})
          </Title>
          {missing > 0 && (
            <Badge
              color='orange'
              variant='light'
              radius='sm'
              leftSection={<IconUserQuestion size={12} />}
            >
              Needs a goalie
            </Badge>
          )}
        </Group>
        {isAdmin() && (
          <Button
            size='xs'
            variant='light'
            leftSection={<IconPlus size={14} />}
            onClick={() => setAddOpened(true)}
          >
            Add Goalie
          </Button>
        )}
      </Group>

      {goalies.length === 0 ? (
        <Text size='sm' c='dimmed'>
          No goalies yet.
        </Text>
      ) : (
        <Group gap='xl' wrap='wrap'>
          {goalies.map((goalie) => (
            <Group key={goalie.UserId} gap='xs' wrap='nowrap'>
              <Link
                to={`/profile/${goalie.UserId}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Group gap='sm' wrap='nowrap'>
                  <GoalieAvatar goalie={goalie} size={48} />
                  <Stack gap={0}>
                    <Text fw={600}>{goalieName(goalie)}</Text>
                    <Text size='xs' c='dimmed'>
                      Goalie
                    </Text>
                  </Stack>
                </Group>
              </Link>
              {isAdmin() && (
                <Tooltip label='Remove from session'>
                  <ActionIcon
                    variant='subtle'
                    color='red'
                    size='sm'
                    aria-label={`Remove ${goalieName(goalie)}`}
                    onClick={() => confirmRemove(goalie)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          ))}
        </Group>
      )}

      {isAdmin() && (
        <AddRosterPlayerModal
          opened={addOpened}
          onClose={() => setAddOpened(false)}
          session={session}
          defaultPosition={PositionPreference.Goalie}
          onSessionUpdate={onSessionUpdate}
        />
      )}
    </Paper>
  );
};
