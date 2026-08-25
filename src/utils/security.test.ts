import { afterEach, describe, expect, it, vi } from "vitest";
import { shouldShowAppLock } from "@/utils/security";

const GRACE_MS = 5 * 60 * 1000;
const NOW = new Date("2026-05-20T12:00:00.000Z");

function at(msAgo: number) {
  return new Date(NOW.getTime() - msAgo).toISOString();
}

afterEach(() => {
  vi.useRealTimers();
});

describe("app lock", () => {
  function freeze() {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  }

  it("stays unlocked when the preference is off", () => {
    freeze();
    expect(shouldShowAppLock(false, at(GRACE_MS * 10))).toBe(false);
    expect(shouldShowAppLock(false, undefined)).toBe(false);
  });

  it("locks when enabled but never unlocked", () => {
    freeze();
    expect(shouldShowAppLock(true, undefined)).toBe(true);
  });

  it("stays unlocked inside the grace window", () => {
    freeze();
    expect(shouldShowAppLock(true, at(0))).toBe(false);
    expect(shouldShowAppLock(true, at(GRACE_MS - 1000))).toBe(false);
  });

  it("locks once the grace window has passed", () => {
    freeze();
    expect(shouldShowAppLock(true, at(GRACE_MS + 1000))).toBe(true);
  });

  it("does not unlock on the boundary itself", () => {
    freeze();
    // Exactly at the boundary the app stays unlocked; one millisecond later it
    // locks. Pinned so the comparison cannot silently flip to >= or <=.
    expect(shouldShowAppLock(true, at(GRACE_MS))).toBe(false);
    expect(shouldShowAppLock(true, at(GRACE_MS + 1))).toBe(true);
  });

  it("locks rather than failing open on an unparseable timestamp", () => {
    freeze();
    // A corrupted persisted value must not leave the vault unlocked.
    expect(shouldShowAppLock(true, "not-a-date")).toBe(true);
  });

  it("locks rather than failing open on a future timestamp", () => {
    freeze();
    // A clock moved backwards leaves a stored unlock time in the future, which
    // would otherwise hold the grace window open indefinitely.
    expect(shouldShowAppLock(true, new Date(NOW.getTime() + GRACE_MS * 10).toISOString())).toBe(true);
    expect(shouldShowAppLock(true, new Date(NOW.getTime() + 1000).toISOString())).toBe(true);
  });
});
