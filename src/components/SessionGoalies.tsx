import { SessionDetailedResponse, SessionGoalie } from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { getSessionGoalies, goalieName, openNets } from '@/lib/goalies';
import { sessionService } from '@/lib/session';
import { ActionIcon, Badge, Group, Paper, Stack, Text, ThemeIcon, Title, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconHandStop, IconTrash, IconUserQuestion } from '@tabler/icons-react';
import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { GoalieAvatar } from './GoalieAvatar';
import { useRatingsVisibility } from './RatingsToggle';

interface SessionGoaliesProps {
  session: SessionDetailedResponse;
  onSessionUpdate: (_session: SessionDetailedResponse) => void;
}

/**
 * The session's goalies, from the roster — a sub-panel of the session header, under the note.
 * No ratings and no team: goalies swap ends midway, so they belong to neither side. Goalies are
 * added through the roster's "Add to Roster"; the remove control only shows in unlocked admin mode.
 */
export const SessionGoalies = ({ session, onSessionUpdate }: SessionGoaliesProps): JSX.Element => {
  const { isAdmin } = useAuth();
  const { showRatings } = useRatingsVisibility();
  const canEdit = isAdmin() && showRatings;
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
        <Text size='sm'>Remove {goalieName(goalie)} from this session&apos;s roster?</Text>
      ),
      labels: { confirm: 'Remove', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        void removeGoalie(goalie);
      },
    });
  };

  return (
    <Paper withBorder p='md' mt='md' bg='rgba(255, 255, 255, 0.05)'>
      <Group justify='space-between' wrap='nowrap' gap='sm' mb={goalies.length > 0 ? 'md' : 0}>
        <Group gap='sm' align='center' wrap='nowrap'>
          <ThemeIcon color='teal' variant='light' radius='md' size='lg'>
            <IconHandStop size={20} />
          </ThemeIcon>
          <Title order={5} style={{ lineHeight: 1.15 }}>
            Goalies
          </Title>
        </Group>
        {missing > 0 && (
          <Badge
            color='orange'
            variant='light'
            radius='sm'
            leftSection={<IconUserQuestion size={12} />}
            style={{ flexShrink: 0 }}
          >
            Needs a goalie
          </Badge>
        )}
      </Group>

      {goalies.length > 0 && (
        <Group gap='xl' wrap='wrap'>
          {goalies.map((goalie) => (
            <Group key={goalie.UserId} gap='xs' wrap='nowrap'>
              <Link
                to={`/profile/${goalie.UserId}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Group gap='sm' wrap='nowrap'>
                  <GoalieAvatar goalie={goalie} size={40} />
                  <Stack gap={0}>
                    <Text fw={600}>{goalieName(goalie)}</Text>
                    <Text size='xs' c='dimmed'>
                      Goalie
                    </Text>
                  </Stack>
                </Group>
              </Link>
              {canEdit && (
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
    </Paper>
  );
};
