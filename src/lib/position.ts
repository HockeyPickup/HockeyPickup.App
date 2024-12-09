/* eslint-disable no-unused-vars */
export enum Position {
  TBD = 0,
  Forward = 1,
  Defense = 2,
}

// Define the literal type directly instead of using typeof positionMap
export type PositionString = 'TBD' | 'Forward' | 'Defense';

export const positionMap: Record<PositionString, Position> = {
  TBD: Position.TBD,
  Forward: Position.Forward,
  Defense: Position.Defense,
};
