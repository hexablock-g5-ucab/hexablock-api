import type {
  AccessTokenClaims,
  TokenService,
} from '../../src/application/ports/token-service.port';

export class FakeTokenService implements TokenService {
  readonly signed: AccessTokenClaims[] = [];

  sign(claims: AccessTokenClaims): Promise<string> {
    this.signed.push({ ...claims });
    return Promise.resolve(`token:${claims.sub}:${claims.role}`);
  }
}
