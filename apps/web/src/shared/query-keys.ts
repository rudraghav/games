export const keys = {
  me: ['player'] as const,
  account: ['account'] as const,
  room: (id: string) => ['room', id] as const,
};
