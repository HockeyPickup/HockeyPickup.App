import { Group, Text, ThemeIcon } from '@mantine/core';
import { IconHandStop } from '@tabler/icons-react';
import { JSX } from 'react';

interface GoalieNetChipProps {
  variant?: 'full' | 'compact';
}

/**
 * The goalie equivalent of the skater's team chip.
 *
 * Deliberately says nothing about Light or Dark: goalies swap ends midway through every skate,
 * so they belong to neither team and claiming otherwise would be wrong.
 */
export const GoalieNetChip = ({ variant = 'full' }: GoalieNetChipProps): JSX.Element => {
  const compact = variant === 'compact';

  return (
    <Group
      gap={compact ? 6 : 'sm'}
      wrap='nowrap'
      style={{
        background: 'var(--mantine-color-dark-9)',
        border: '1px solid var(--mantine-color-teal-7)',
        borderRadius: 'var(--mantine-radius-md)',
        padding: compact ? '3px 10px' : '8px 16px',
        width: 'fit-content',
      }}
    >
      <ThemeIcon color='teal' variant='transparent' size={compact ? 18 : 28} p={0}>
        <IconHandStop size={compact ? 16 : 24} />
      </ThemeIcon>
      <Text size={compact ? 'sm' : 'xl'} fw={compact ? 600 : 700} c='teal.2'>
        {compact ? 'In net' : "You're in net"}
      </Text>
    </Group>
  );
};
