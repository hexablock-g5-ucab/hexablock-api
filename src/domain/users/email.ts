/** Canonical form used to store and look up an email: surrounding spaces removed, lower case. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
