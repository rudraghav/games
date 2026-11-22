export const keys = {
  me: ['player'] as const,
  account: ['account'] as const,
  /** The player's own level, streak, badges and rewards. */
  progress: ['progress'] as const,
  room: (id: string) => ['room', id] as const,
};
