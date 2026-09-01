import { RosterPlayer, SessionDetailedResponse } from '@/HockeyPickup.Api';
import { Checkbox, Group } from '@mantine/core';
import { JSX, useState } from 'react';
import { EmailList } from './EmailList';

interface SessionEmailsProps {
  session: SessionDetailedResponse;
}

export const SessionEmails = ({ session }: SessionEmailsProps): JSX.Element => {
  const [activeOnly, setActiveOnly] = useState(true);
  const [commaSeparated, setCommaSeparated] = useState(false);

  const getEmails = (): string => {
    return (
      session.CurrentRosters?.filter((player: RosterPlayer) => !activeOnly || player?.IsPlaying)
        .map((player: RosterPlayer) => player?.Email)
        .filter(Boolean)
        .sort()
        .join(commaSeparated ? ', ' : '\n') ?? ''
    );
  };

  const filter = (
    <Group gap='md'>
      <Checkbox
        size='xs'
        label='Active roster only'
        checked={activeOnly}
        onChange={(event) => setActiveOnly(event.currentTarget.checked)}
      />
      <Checkbox
        size='xs'
        label='Comma separated'
        checked={commaSeparated}
        onChange={(event) => setCommaSeparated(event.currentTarget.checked)}
      />
    </Group>
  );

  return <EmailList getEmails={getEmails} filter={filter} />;
};
