const LOCK_GRACE_MS = 5 * 60 * 1000;

export function shouldShowAppLock(enabled: boolean, lastUnlockedAt?: string) {
  if (!enabled) {
    return false;
  }

  if (!lastUnlockedAt) {
    return true;
  }

  return Date.now() - new Date(lastUnlockedAt).getTime() > LOCK_GRACE_MS;
}
