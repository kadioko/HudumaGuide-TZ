import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const storage = new Map<string, string>();
  return {
    storage,
    insert: vi.fn()
  };
});

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn((key: string) => Promise.resolve(mocks.storage.get(key) ?? null)),
    setItem: vi.fn((key: string, value: string) => {
      mocks.storage.set(key, value);
      return Promise.resolve();
    }),
    removeItem: vi.fn((key: string) => {
      mocks.storage.delete(key);
      return Promise.resolve();
    }),
    multiRemove: vi.fn((keys: string[]) => {
      keys.forEach((key) => mocks.storage.delete(key));
      return Promise.resolve();
    })
  }
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: mocks.insert
    }))
  }
}));

vi.mock("@/services/runtimeLogger", () => ({
  reportRuntimeIssue: vi.fn()
}));

describe("analytics sync", () => {
  beforeEach(() => {
    mocks.storage.clear();
    mocks.insert.mockReset();
  });

  it("keeps failed remote inserts in a retry queue", async () => {
    mocks.insert.mockResolvedValueOnce({ error: new Error("offline") });
    const { getPendingAnalyticsEvents, trackAnalyticsEvent } = await import("@/services/analyticsService");

    await trackAnalyticsEvent("service_search", { query: "TIN" }, "user-1");
    const pending = await getPendingAnalyticsEvents();

    expect(pending).toHaveLength(1);
    expect(pending[0].event.payload.query).toBe("tin");
  });

  it("redacts sensitive free text in analytics payloads", async () => {
    mocks.insert.mockResolvedValueOnce({ error: new Error("offline") });
    const { getPendingAnalyticsEvents, trackAnalyticsEvent } = await import("@/services/analyticsService");

    await trackAnalyticsEvent("service_search", { query: "john@example.com 0712 123 456 NIDA 123456789 TIN 987654" }, "user-1");
    const pending = await getPendingAnalyticsEvents();

    expect(pending[0].event.payload.query).toContain("[email]");
    expect(pending[0].event.payload.query).toContain("[number]");
    expect(pending[0].event.payload.query).toContain("[nida]");
    expect(pending[0].event.payload.query).toContain("[tin]");
  });

  it("flushes queued analytics events after a successful insert", async () => {
    mocks.insert.mockResolvedValueOnce({ error: new Error("offline") }).mockResolvedValueOnce({ error: null });
    const { flushQueuedAnalyticsEvents, getPendingAnalyticsEvents, trackAnalyticsEvent } = await import("@/services/analyticsService");

    await trackAnalyticsEvent("guide_saved", { guideSlug: "nida" }, "user-1");
    const pending = await getPendingAnalyticsEvents();
    pending[0].nextAttemptAt = new Date(Date.now() - 1).toISOString();
    mocks.storage.set("hudumaguide-tz-analytics-pending-sync", JSON.stringify(pending));
    await flushQueuedAnalyticsEvents();

    expect(await getPendingAnalyticsEvents()).toEqual([]);
    expect(mocks.insert).toHaveBeenLastCalledWith([
      expect.objectContaining({
        event_name: "guide_saved",
        user_id: "user-1"
      })
    ]);
  });

  it("clears local analytics history and pending sync events", async () => {
    mocks.insert.mockResolvedValueOnce({ error: new Error("offline") });
    const { clearLocalAnalyticsData, getLocalAnalyticsEvents, getPendingAnalyticsEvents, trackAnalyticsEvent } = await import("@/services/analyticsService");

    await trackAnalyticsEvent("guide_saved", { guideSlug: "nida" }, "user-1");
    await clearLocalAnalyticsData();

    expect(await getLocalAnalyticsEvents()).toEqual([]);
    expect(await getPendingAnalyticsEvents()).toEqual([]);
  });
});
