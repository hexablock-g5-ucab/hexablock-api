import type { Role, User } from '../../../domain/users/user';

/** What the API returns about a user: never the password or its hash. */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: Role;
}

/** Copies only the profile fields, so extra fields an adapter might attach are never returned. */
export function toUserProfile(user: User): UserProfile {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  };
}
