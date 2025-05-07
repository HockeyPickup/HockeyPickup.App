import { RegularSetDetailedResponse } from '@/HockeyPickup.Api';
import { GET_REGULARSETS } from '@/lib/queries';
import { useQuery } from '@apollo/client';
import { Button, Checkbox, Group, Modal, Select, Stack, Text } from '@mantine/core';
import { IconFilter } from '@tabler/icons-react';
import { JSX, useState } from 'react';

// Constants for day options
const dayOptions = [
  { value: '', label: 'All Days' },
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

const getDayOfWeek = (dayNumber: number): string | undefined => {
  return dayOptions.find((v) => v.value === dayNumber.toString())?.label;
};

interface RegularSetSelectProps {
  value: string | null;
  onChange: (_value: string | null) => void;
  defaultIncludeArchived?: boolean;
}

export const RegularSetSelect = ({
  value,
  onChange,
  defaultIncludeArchived = false,
}: RegularSetSelectProps): JSX.Element => {
  const [filterOpened, setFilterOpened] = useState(false);
  const [includeArchived, setIncludeArchived] = useState<boolean>(defaultIncludeArchived);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string | null>(null);

  const { data, loading } = useQuery<{ RegularSets: RegularSetDetailedResponse[] }>(
    GET_REGULARSETS,
  );

  const regularSetOptions =
    data?.RegularSets?.filter(
      (s) =>
        (includeArchived || !s.Archived) &&
        (!selectedDayFilter || s.DayOfWeek.toString() === selectedDayFilter),
    ).map((s) => ({
      value: s.RegularSetId.toString(),
      label: s.Description ?? '',
    })) ?? [];

  const selectedPresetData = data?.RegularSets?.find(
    (set) => set.RegularSetId.toString() === value,
  );

  const FilterModal = (): JSX.Element => (
    <Modal
      opened={filterOpened}
      onClose={() => setFilterOpened(false)}
      title='Filter Regular Sets'
      size='sm'
    >
      <Stack>
        <Checkbox
          label='Include Archived'
          checked={includeArchived}
          onChange={(event) => setIncludeArchived(event.currentTarget.checked)}
        />
        <Select
          label='Day of Week'
          placeholder='Select day'
          data={dayOptions}
          value={selectedDayFilter}
          onChange={setSelectedDayFilter}
          clearable
        />
        <Group justify='flex-end'>
          <Button variant='outline' onClick={() => setFilterOpened(false)}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );

  return (
    <Stack style={{ flex: 1 }} gap='xs'>
      <Group align='flex-start'>
        <Stack style={{ flex: 1 }} gap='xs'>
          <Select
            label='Select Regular Set'
            placeholder='Choose a regular set'
            data={regularSetOptions}
            value={value}
            onChange={onChange}
            disabled={loading}
            required
          />
          {selectedPresetData && (
            <Text size='sm' c='dimmed' ml='sm'>
              {selectedPresetData.Description} - {getDayOfWeek(selectedPresetData.DayOfWeek)}
            </Text>
          )}
        </Stack>
        <Button
          mt='lg'
          variant='subtle'
          leftSection={<IconFilter size={16} />}
          onClick={() => setFilterOpened(true)}
        >
          Filter
        </Button>
      </Group>
      <FilterModal />
    </Stack>
  );
};
