import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { AnalyticsEvent, AnalyticsEventName } from "@/types";

const ANALYTICS_QUEUE_KEY = "hudumaguide-tz-analytics-events";

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
      acc[key] = value.toLowerCase().trim().slice(0, 48);
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

  if (!supabase) {
    return;
  }

  await supabase.from("analytics_events").insert({
    user_id: userId ?? null,
    event_name: event.name,
    event_count: event.count,
    payload: event.payload,
    occurred_at: event.createdAt
  });
}

export async function getLocalAnalyticsEvents() {
  const value = await AsyncStorage.getItem(ANALYTICS_QUEUE_KEY);
  return value ? (JSON.parse(value) as AnalyticsEvent[]) : [];
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
