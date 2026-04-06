export const ACTIVE_BRANCH_COOKIE_NAME = 'pulseops-active-branch';
export const ACTIVE_BRANCH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function persistActiveBranchPreference(branchId: string) {
  document.cookie = [
    `${ACTIVE_BRANCH_COOKIE_NAME}=${encodeURIComponent(branchId)}`,
    'Path=/',
    `Max-Age=${String(ACTIVE_BRANCH_COOKIE_MAX_AGE_SECONDS)}`,
    'SameSite=Lax',
  ].join('; ');
}
