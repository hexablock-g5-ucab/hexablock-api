/** Roles of the v6.3 model. A role is assigned by the server, never read from client input. */
export const Role = {
  PLAYER: 'PLAYER',
  ADMIN: 'ADMIN',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

/** A registered account. It never carries the password hash. */
export interface User {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly role: Role;
}
