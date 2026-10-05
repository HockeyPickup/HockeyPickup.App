import {
  PositionPreference,
  SessionDetailedResponse,
  TeamAssignment,
  UserDetailedResponse,
} from '@/HockeyPickup.Api';
import { GET_USERS } from '@/lib/queries';
import { sessionService } from '@/lib/session';
import { UsersQueryResult } from '@/types/graphql';
import { useQuery } from '@apollo/client/react';
import {
  Button,
  Checkbox,
  ComboboxItemGroup,
  Group,
  Input,
  Modal,
  SegmentedControl,
  Select,
  Stack,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { JSX, useEffect, useMemo, useState } from 'react';

interface AddRosterPlayerModalProps {
  opened: boolean;
  onClose: () => void;
  session: SessionDetailedResponse;
  /** Position the modal opens on. */
  defaultPosition: PositionPreference;
  onSessionUpdate: (_session: SessionDetailedResponse) => void;
}

interface AddRosterPlayerForm {
  userId: string;
  position: PositionPreference;
  team: TeamAssignment | '';
}

const POSITIONS = [
  { value: PositionPreference.Forward, label: 'Forward' },
  { value: PositionPreference.Defense, label: 'Defense' },
  { value: PositionPreference.TBD, label: 'TBD' },
  { value: PositionPreference.Goalie, label: 'Goalie' },
];

const TEAMS = [
  { value: TeamAssignment.Light, label: 'Rockets (Light)' },
  { value: TeamAssignment.Dark, label: 'Beauties (Dark)' },
];

interface PlayerOption {
  value: string;
  label: string;
}

const byLastName = (a: UserDetailedResponse, b: UserDetailedResponse): number =>
  (a.LastName ?? '').localeCompare(b.LastName ?? '') ||
  (a.FirstName ?? '').localeCompare(b.FirstName ?? '');

const toOption = (user: UserDetailedResponse): PlayerOption => ({
  value: user.Id,
  label: `${user.FirstName} ${user.LastName}${user.Active ? '' : ' (inactive)'}`,
});

/**
 * Admin add-to-roster: a goalie, or a skater who walked up at the rink. Bypasses Buy/Sell — no
 * BuySell or payment record is created. Opened from the roster's "Add to Roster".
 */
export const AddRosterPlayerModal = ({
  opened,
  onClose,
  session,
  defaultPosition,
  onSessionUpdate,
}: AddRosterPlayerModalProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const { data: allUsers } = useQuery<UsersQueryResult>(GET_USERS, { skip: !opened });

  const form = useForm<AddRosterPlayerForm>({
    initialValues: { userId: '', position: defaultPosition, team: '' },
    validate: {
      userId: (value) => (value ? null : 'Pick a player'),
      team: (value, values) =>
        values.position === PositionPreference.Goalie || value
          ? null
          : 'A skater must be assigned to Light or Dark',
    },
  });

  // Each open starts clean, on the position the caller asked for
  useEffect(() => {
    if (opened) {
      form.setValues({ userId: '', position: defaultPosition, team: '' });
      form.resetDirty();
      form.clearErrors();
      setIncludeInactive(false);
    }
  }, [opened, defaultPosition]);

  const isGoalie = form.values.position === PositionPreference.Goalie;

  const options = useMemo<ComboboxItemGroup<PlayerOption>[] | PlayerOption[]>(() => {
    const playing = new Set(
      (session.CurrentRosters ?? []).filter((player) => player.IsPlaying).map((player) => player.UserId),
    );
    const candidates = (allUsers?.UsersEx ?? [])
      .filter((user) => (includeInactive || user.Active) && !playing.has(user.Id))
      .sort(byLastName);

    if (!isGoalie) return candidates.map(toOption);

    const goalies = candidates.filter((user) => user.PositionPreference === PositionPreference.Goalie);
    const everyoneElse = candidates.filter(
      (user) => user.PositionPreference !== PositionPreference.Goalie,
    );
    return [
      { group: 'Goalies', items: goalies.map(toOption) },
      { group: 'Everyone else', items: everyoneElse.map(toOption) },
    ].filter((group) => group.items.length > 0);
  }, [allUsers, includeInactive, isGoalie, session.CurrentRosters]);

  const handleSubmit = async (values: AddRosterPlayerForm): Promise<void> => {
    setLoading(true);
    try {
      const result = await sessionService.addRosterPlayer({
        SessionId: session.SessionId,
        UserId: values.userId,
        Position: values.position,
        // Ignored for a goalie: the Api stores TBD
        TeamAssignment: values.team === '' ? TeamAssignment.TBD : values.team,
      });
      if (result.Data !== null && result.Data !== undefined) {
        onSessionUpdate(result.Data);
      }
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: isGoalie ? 'Goalie Added' : 'Player Added',
        message: result.Message,
        color: 'green',
      });
      onClose();
    } catch (error) {
      console.error('Failed to add player to roster:', error);
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Error',
        message:
          (error as { response?: { data: { Message: string } } }).response?.data?.Message ??
          'Failed to add player to the roster',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title='Add to Roster'
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Input.Wrapper label='Position'>
            <SegmentedControl
              fullWidth
              data={POSITIONS}
              value={form.values.position}
              onChange={(value) => form.setFieldValue('position', value as PositionPreference)}
            />
          </Input.Wrapper>
          {!isGoalie && (
            <Input.Wrapper label='Team' required error={form.errors.team}>
              <SegmentedControl
                fullWidth
                data={TEAMS}
                value={form.values.team}
                onChange={(value) => form.setFieldValue('team', value as TeamAssignment)}
              />
            </Input.Wrapper>
          )}
          <Select
            label='Player'
            placeholder='Select player'
            data={options}
            searchable
            nothingFoundMessage='Nobody matches'
            maxDropdownHeight={320}
            comboboxProps={{ withinPortal: true }}
            {...form.getInputProps('userId')}
          />
          <Checkbox
            label='Include inactive players'
            checked={includeInactive}
            onChange={(event) => setIncludeInactive(event.currentTarget.checked)}
          />
          <Group justify='flex-end' mt='md'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' loading={loading}>
              Add to Roster
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
