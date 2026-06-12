import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { reportRuntimeIssue } from "@/services/runtimeLogger";
import { AnalyticsEvent, AnalyticsEventName } from "@/types";

const ANALYTICS_QUEUE_KEY = "hudumaguide-tz-analytics-events";
const ANALYTICS_PENDING_SYNC_KEY = "hudumaguide-tz-analytics-pending-sync";
const ANALYTICS_BACKOFF_MS = [0, 30_000, 120_000, 600_000];

type AnalyticsPayload = Record<string, string | number | boolean | string[] | undefined>;

const allowedPayloadKeys = new Set([
  "query",
  "resultCount",
  "categoryId",
  "guideSlug",
  "guideSlugs",
  "language",
  "region",
  "city",
  "step",
  "structure",
  "industry",
  "reminderCategory",
  "confidence",
  "fallbackUsed",
  "questionLength",
  "supportCategory"
]);

function sanitizePayload(payload: AnalyticsPayload) {
  return Object.entries(payload).reduce<AnalyticsPayload>((acc, [key, value]) => {
    if (!allowedPayloadKeys.has(key) || value === undefined) {
      return acc;
    }

    if (key === "query" && typeof value === "string") {
      acc[key] = redactFreeText(value.toLowerCase().trim()).slice(0, 48);
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});
}

export async function trackAnalyticsEvent(name: AnalyticsEventName, payload: AnalyticsPayload = {}, userId?: string) {
  const event: AnalyticsEvent = {
    id: `analytics-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    name,
    count: 1,
    payload: sanitizePayload(payload),
    createdAt: new Date().toISOString()
  };

  await appendLocalEvent(event);
  await appendPendingEvent(event, userId);

  if (!supabase) {
    return;
  }

  await flushQueuedAnalyticsEvents();
}

export async function getLocalAnalyticsEvents() {
  const value = await AsyncStorage.getItem(ANALYTICS_QUEUE_KEY);
  return value ? (JSON.parse(value) as AnalyticsEvent[]) : [];
}

export async function getPendingAnalyticsEvents() {
  const value = await AsyncStorage.getItem(ANALYTICS_PENDING_SYNC_KEY);
  return value ? (JSON.parse(value) as PendingAnalyticsEvent[]) : [];
}

export async function flushQueuedAnalyticsEvents() {
  if (!supabase) {
    return;
  }

  const pending = await getPendingAnalyticsEvents();
  const now = Date.now();
  const ready = pending.filter((item) => !item.nextAttemptAt || new Date(item.nextAttemptAt).getTime() <= now);
  if (!ready.length) {
    return;
  }

  const rows = ready.map((item) => ({
    user_id: item.userId ?? null,
    event_name: item.event.name,
    event_count: item.event.count,
    payload: item.event.payload,
    occurred_at: item.event.createdAt
  }));

  const { error } = await supabase.from("analytics_events").insert(rows);
  if (error) {
    const failedIds = new Set(ready.map((item) => item.event.id));
    const nextPending = pending.map((item) => {
      if (!failedIds.has(item.event.id)) {
        return item;
      }

      const attempts = item.attempts + 1;
      const delay = ANALYTICS_BACKOFF_MS[Math.min(attempts, ANALYTICS_BACKOFF_MS.length - 1)];
      return {
        ...item,
        attempts,
        lastError: error.message,
        nextAttemptAt: new Date(now + delay).toISOString()
      };
    });
    await AsyncStorage.setItem(ANALYTICS_PENDING_SYNC_KEY, JSON.stringify(nextPending));
    reportRuntimeIssue("analytics-sync", error, { pendingCount: pending.length, readyCount: ready.length });
    return;
  }

  const syncedIds = new Set(ready.map((item) => item.event.id));
  const remaining = pending.filter((item) => !syncedIds.has(item.event.id));
  if (remaining.length) {
    await AsyncStorage.setItem(ANALYTICS_PENDING_SYNC_KEY, JSON.stringify(remaining));
  } else {
    await AsyncStorage.removeItem(ANALYTICS_PENDING_SYNC_KEY);
  }
}

export async function clearLocalAnalyticsData() {
  await AsyncStorage.multiRemove([ANALYTICS_QUEUE_KEY, ANALYTICS_PENDING_SYNC_KEY]);
}

export async function getLocalAnalyticsSummary() {
  const events = await getLocalAnalyticsEvents();
  return summarizeAnalyticsEvents(events);
}

export async function getRemoteAnalyticsSummary() {
  if (!supabase) {
    return undefined;
  }

  const { data, error } = await supabase
    .from("analytics_events")
    .select("id, event_name, event_count, payload, occurred_at")
    .order("occurred_at", { ascending: false })
    .limit(5000);

  if (error) {
    throw error;
  }

  return summarizeAnalyticsEvents(
    (data ?? []).map((row) => ({
      id: row.id,
      name: row.event_name as AnalyticsEventName,
      count: row.event_count ?? 1,
      payload: row.payload ?? {},
      createdAt: row.occurred_at
    }))
  );
}

function summarizeAnalyticsEvents(events: AnalyticsEvent[]) {
  const counts = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.name] = (acc[event.name] ?? 0) + event.count;
    return acc;
  }, {});

  const topSearches = topValues(events, "service_search", "query");
  const noResultSearches = topValues(events, "service_search_no_results", "query");
  const savedGuides = topValues(events, "guide_saved", "guideSlug");
  const reminderCategories = topValues(events, "reminder_created", "reminderCategory");
  const reportedGuides = topValues(events, "outdated_report_submitted", "guideSlug");

  return { counts, topSearches, noResultSearches, savedGuides, reminderCategories, reportedGuides };
}

async function appendLocalEvent(event: AnalyticsEvent) {
  const current = await getLocalAnalyticsEvents();
  await AsyncStorage.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify([event, ...current].slice(0, 500)));
}

type PendingAnalyticsEvent = {
  event: AnalyticsEvent;
  userId?: string;
  attempts: number;
  nextAttemptAt?: string;
  lastError?: string;
};

async function appendPendingEvent(event: AnalyticsEvent, userId?: string) {
  const current = await getPendingAnalyticsEvents();
  const next = [{ event, userId, attempts: 0 }, ...current].slice(0, 500);
  await AsyncStorage.setItem(ANALYTICS_PENDING_SYNC_KEY, JSON.stringify(next));
}

function redactFreeText(value: string) {
  return value
    .replace(/\b(nida|nin|tin)\s*[:#-]?\s*[a-z0-9-]{4,}\b/gi, "[$1]")
    .replace(/\b[\w.+-]+@[\w.-]+\.\w+\b/g, "[email]")
    .replace(/\+?\d[\d\s-]{6,}\d/g, "[number]")
    .replace(/\b\d{8,}\b/g, "[number]");
}

function topValues(events: AnalyticsEvent[], name: AnalyticsEventName, key: string) {
  const counts = events
    .filter((event) => event.name === name)
    .reduce<Record<string, number>>((acc, event) => {
      const value = event.payload[key];
      if (!value || Array.isArray(value)) {
        return acc;
      }

      acc[String(value)] = (acc[String(value)] ?? 0) + 1;
      return acc;
    }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, count]) => ({ label, count }));
}
