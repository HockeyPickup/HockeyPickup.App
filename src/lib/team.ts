/* eslint-disable no-unused-vars */
export enum Team {
  TBD = 0,
  Light = 1,
  Dark = 2,
}

export type TeamString = 'TBD' | 'Light' | 'Dark';

export const teamMap: Record<TeamString, Team> = {
  TBD: Team.TBD,
  Light: Team.Light,
  Dark: Team.Dark,
};

export const getTeamString = (teamId: number): string => {
  return Team[teamId] || 'TBD';
};

export const TEAM_LABELS: Record<Team, string> = {
  [Team.TBD]: 'Unassigned',
  [Team.Light]: 'Light Team',
  [Team.Dark]: 'Dark Team',
};
