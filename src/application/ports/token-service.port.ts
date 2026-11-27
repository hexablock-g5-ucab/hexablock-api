import type { Role } from '../../domain/users/user';

export const TOKEN_SERVICE = Symbol('TokenService');

export interface AccessTokenClaims {
  sub: string;
  role: Role;
}

export interface TokenService {
  sign(claims: AccessTokenClaims): Promise<string>;
}
