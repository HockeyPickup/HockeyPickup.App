import { RosterPlayer, SessionDetailedResponse } from '@/HockeyPickup.Api';
import { SegmentedControl } from '@mantine/core';
import { JSX, useState } from 'react';
import { EmailList } from './EmailList';

interface SessionEmailsProps {
  session: SessionDetailedResponse;
}

type RosterEmailFilter = 'active' | 'all';

export const SessionEmails = ({ session }: SessionEmailsProps): JSX.Element => {
  const [rosterFilter, setRosterFilter] = useState<RosterEmailFilter>('active');

  const getEmails = (): string => {
    return (
      session.CurrentRosters?.filter(
        (player: RosterPlayer) => rosterFilter === 'all' || player?.IsPlaying,
      )
        .map((player: RosterPlayer) => player?.Email)
        .filter(Boolean)
        .sort()
        .join('\n') ?? ''
    );
  };

  const filter = (
    <SegmentedControl
      size='xs'
      value={rosterFilter}
      onChange={(value) => setRosterFilter(value as RosterEmailFilter)}
      data={[
        { label: 'Active Roster', value: 'active' },
        { label: 'All Players', value: 'all' },
      ]}
    />
  );

  return <EmailList getEmails={getEmails} filter={filter} />;
};
