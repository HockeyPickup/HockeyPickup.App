import { RosterPlayer, SessionDetailedResponse } from '@/HockeyPickup.Api';
import { Checkbox } from '@mantine/core';
import { JSX, useState } from 'react';
import { EmailList } from './EmailList';

interface SessionEmailsProps {
  session: SessionDetailedResponse;
}

export const SessionEmails = ({ session }: SessionEmailsProps): JSX.Element => {
  const [activeOnly, setActiveOnly] = useState(true);

  const getEmails = (): string => {
    return (
      session.CurrentRosters?.filter((player: RosterPlayer) => !activeOnly || player?.IsPlaying)
        .map((player: RosterPlayer) => player?.Email)
        .filter(Boolean)
        .sort()
        .join('\n') ?? ''
    );
  };

  const filter = (
    <Checkbox
      size='xs'
      label='Active roster only'
      checked={activeOnly}
      onChange={(event) => setActiveOnly(event.currentTarget.checked)}
    />
  );

  return <EmailList getEmails={getEmails} filter={filter} />;
};
