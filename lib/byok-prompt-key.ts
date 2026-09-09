/**
 * Shared localStorage key for the "you're on the shared AI key" one-time
 * nudge, scoped per signed-in identity so switching accounts in the same
 * browser doesn't suppress the notice for a different user.
 */
export function byokPromptKey(identity: string | null | undefined): string {
  return `overseer.byok.prompted.${identity ?? 'anon'}`;
}
