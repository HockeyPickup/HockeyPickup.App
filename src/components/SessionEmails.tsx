import { RosterPlayer, SessionDetailedResponse } from '@/HockeyPickup.Api';
import { JSX } from 'react';
import { EmailList } from './EmailList';

interface SessionEmailsProps {
  session: SessionDetailedResponse;
}

export const SessionEmails = ({ session }: SessionEmailsProps): JSX.Element => {
  const getEmails = (): string => {
    return (
      session.CurrentRosters?.map((player: RosterPlayer) => player?.Email)
        .filter(Boolean)
        .sort()
        .join('\n') ?? ''
    );
  };

  return <EmailList getEmails={getEmails} />;
};
