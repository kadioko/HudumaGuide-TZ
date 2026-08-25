const LOCK_GRACE_MS = 5 * 60 * 1000;

export function shouldShowAppLock(enabled: boolean, lastUnlockedAt?: string) {
  if (!enabled) {
    return false;
  }

  if (!lastUnlockedAt) {
    return true;
  }

  const unlockedAt = new Date(lastUnlockedAt).getTime();

  // Fail closed on a timestamp we cannot trust. An unparseable value yields NaN,
  // and every NaN comparison is false, which previously left the vault unlocked.
  // A timestamp in the future means the device clock moved backwards, which
  // would otherwise keep the grace window open indefinitely.
  if (!Number.isFinite(unlockedAt) || unlockedAt > Date.now()) {
    return true;
  }

  return Date.now() - unlockedAt > LOCK_GRACE_MS;
}
