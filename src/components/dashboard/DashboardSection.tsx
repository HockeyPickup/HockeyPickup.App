import { Alert, Box, Button, Group, Text } from '@mantine/core';
import { IconAlertTriangle, IconArrowRight } from '@tabler/icons-react';
import { JSX, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface DashboardSectionProps {
  title: string;
  /** Optional "View All"-style link, matching the existing home page affordance. */
  actionLabel?: string;
  actionTo?: string;
  children: ReactNode;
}

export const DashboardSection = ({
  title,
  actionLabel,
  actionTo,
  children,
}: DashboardSectionProps): JSX.Element => (
  <Box>
    <Group justify='space-between' align='center' mb='sm' wrap='nowrap'>
      <Text size='1.35rem' fw={700}>
        {title}
      </Text>
      {actionLabel && actionTo && (
        <Button
          variant='outline'
          size='xs'
          component={Link}
          to={actionTo}
          rightSection={<IconArrowRight size={14} />}
          style={{
            color: '#339AF0',
            borderColor: '#1864AB',
            backgroundColor: 'rgba(24, 100, 171, 0.1)',
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Group>
    {children}
  </Box>
);

interface ZoneErrorProps {
  message: string;
  onRetry?: () => void;
}

/**
 * Per-zone failure. The dashboard runs three independent queries; one falling over must degrade
 * its own section only, never blank the page.
 */
export const ZoneError = ({ message, onRetry }: ZoneErrorProps): JSX.Element => (
  <Alert color='red' variant='light' radius='md' icon={<IconAlertTriangle size={18} />}>
    <Group justify='space-between' align='center' wrap='nowrap'>
      <Text size='sm'>{message}</Text>
      {onRetry && (
        <Button size='xs' variant='light' color='red' onClick={onRetry}>
          Retry
        </Button>
      )}
    </Group>
  </Alert>
);
