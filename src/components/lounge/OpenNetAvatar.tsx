import { Avatar } from '@mantine/core';
import { IconQuestionMark } from '@tabler/icons-react';
import { JSX } from 'react';

/** The empty-crease placeholder: sits where a goalie's face would be when a net is unclaimed. */
export const OpenNetAvatar = ({ size }: { size: number }): JSX.Element => (
  <Avatar
    size={size}
    radius='xl'
    color='orange'
    variant='light'
    alt='Open net'
    style={{ border: '2px dashed var(--mantine-color-orange-6)' }}
  >
    <IconQuestionMark size={Math.round(size * 0.5)} />
  </Avatar>
);
