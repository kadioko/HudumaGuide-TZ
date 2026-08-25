import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationPreferences, Reminder } from "@/types";
import {
  cancelScheduledReminder,
  defaultNotificationPreferences,
  scheduleLocalReminder
} from "@/services/reminderService";

const mocks = vi.hoisted(() => ({
  granted: true,
  scheduleNotificationAsync: vi.fn(),
  cancelScheduledNotificationAsync: vi.fn(),
  requestPermissionsAsync: vi.fn()
}));

vi.mock("expo-notifications", () => ({
  getPermissionsAsync: vi.fn(() => Promise.resolve({ granted: mocks.granted })),
  requestPermissionsAsync: mocks.requestPermissionsAsync,
  scheduleNotificationAsync: mocks.scheduleNotificationAsync,
  cancelScheduledNotificationAsync: mocks.cancelScheduledNotificationAsync,
  SchedulableTriggerInputTypes: { DATE: "date" }
}));

const NOW = new Date(2026, 4, 20, 12, 0, 0);

function reminder(overrides: Partial<Reminder> = {}): Reminder {
  return {
    id: "reminder-1",
    title: "Renew business licence",
    category: "licence",
    date: "2026-06-19",
    repeat: "none",
    notificationEnabled: true,
    createdAt: NOW.toISOString(),
    ...overrides
  };
}

/** Local wall-clock times the service asked expo-notifications to fire at. */
async function scheduledDates(input: Reminder, preferences?: NotificationPreferences) {
  await scheduleLocalReminder(input, preferences);
  return mocks.scheduleNotificationAsync.mock.calls.map((call) => call[0].trigger.date as Date);
}

beforeEach(() => {
  mocks.granted = true;
  mocks.scheduleNotificationAsync.mockReset();
  mocks.scheduleNotificationAsync.mockImplementation((_input: unknown) => Promise.resolve("notification-id"));
  mocks.cancelScheduledNotificationAsync.mockReset();
  mocks.requestPermissionsAsync.mockReset();
  mocks.requestPermissionsAsync.mockResolvedValue({ granted: false });
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("reminder scheduling", () => {
  it("schedules nothing when notifications are switched off for the reminder", async () => {
    const ids = await scheduleLocalReminder(reminder({ notificationEnabled: false }));

    expect(ids).toEqual([]);
    expect(mocks.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("schedules nothing when permission is refused", async () => {
    mocks.granted = false;

    const ids = await scheduleLocalReminder(reminder());

    expect(ids).toEqual([]);
    expect(mocks.requestPermissionsAsync).toHaveBeenCalled();
    expect(mocks.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("schedules a pre-reminder for each configured day plus the due date", async () => {
    const dates = await scheduledDates(reminder());

    // Defaults are 7 and 1 days before, plus "Due today".
    expect(dates).toHaveLength(3);
    expect(mocks.scheduleNotificationAsync.mock.calls.map((call) => call[0].content.body)).toEqual([
      expect.stringContaining("7 days before"),
      expect.stringContaining("1 day before"),
      expect.stringContaining("Due today")
    ]);
  });

  it("honours per-reminder pre-reminder days over the defaults", async () => {
    const dates = await scheduledDates(reminder({ preReminderDays: [3] }));

    expect(dates).toHaveLength(2);
    expect(mocks.scheduleNotificationAsync.mock.calls[0][0].content.body).toContain("3 days before");
  });

  it("returns an id for every scheduled notification", async () => {
    const ids = await scheduleLocalReminder(reminder());

    expect(ids).toEqual(["notification-id", "notification-id", "notification-id"]);
  });

  it("never schedules a notification in the past", async () => {
    const dates = await scheduledDates(reminder({ date: "2026-05-21", preReminderDays: [7, 1] }));

    // A YYYY-MM-DD date parses as UTC midnight, which is 03:00 in East Africa,
    // so for a reminder due tomorrow both the 7-day and the 1-day pre-reminders
    // are already behind us. Only the due-date trigger survives.
    expect(dates.every((date) => date > NOW)).toBe(true);
    expect(dates).toHaveLength(1);
  });

  it("schedules nothing for a one-off reminder whose date has passed", async () => {
    const ids = await scheduleLocalReminder(reminder({ date: "2020-01-01" }));

    expect(ids).toEqual([]);
  });

  it("rolls a repeating reminder forward to its next occurrence", async () => {
    const dates = await scheduledDates(reminder({ date: "2026-01-15", repeat: "monthly", preReminderDays: [] }));

    expect(dates).toHaveLength(1);
    expect(dates[0] > NOW).toBe(true);
  });

  it("tolerates an unparseable reminder date instead of throwing", async () => {
    const ids = await scheduleLocalReminder(reminder({ date: "not-a-date" }));

    expect(ids).toEqual([]);
    expect(mocks.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});

describe("quiet hours", () => {
  const quiet: NotificationPreferences = {
    ...defaultNotificationPreferences,
    quietHoursEnabled: true,
    quietHoursStart: "21:00",
    quietHoursEnd: "07:00",
    defaultPreReminderDays: []
  };

  it("never fires inside the quiet window", async () => {
    const dates = await scheduledDates(reminder({ date: "2026-06-19" }), quiet);

    expect(dates.length).toBeGreaterThan(0);
    for (const date of dates) {
      const minutes = date.getHours() * 60 + date.getMinutes();
      const insideOvernightWindow = minutes >= 21 * 60 || minutes < 7 * 60;
      expect(insideOvernightWindow, `${date.toString()} falls inside quiet hours`).toBe(false);
    }
  });

  it("moves a quiet-hours trigger to the end of the window", async () => {
    const dates = await scheduledDates(reminder({ date: "2026-06-19" }), quiet);

    expect(dates[0].getHours()).toBe(7);
    expect(dates[0].getMinutes()).toBe(0);
  });

  it("leaves triggers alone when quiet hours are disabled", async () => {
    const dates = await scheduledDates(reminder({ date: "2026-06-19" }), {
      ...quiet,
      quietHoursEnabled: false
    });

    expect(dates[0].getHours()).not.toBe(7);
  });

  it("handles a daytime quiet window that does not cross midnight", async () => {
    const daytime: NotificationPreferences = {
      ...quiet,
      quietHoursStart: "01:00",
      quietHoursEnd: "18:00"
    };

    const dates = await scheduledDates(reminder({ date: "2026-06-19" }), daytime);

    for (const date of dates) {
      const minutes = date.getHours() * 60 + date.getMinutes();
      expect(minutes >= 1 * 60 && minutes < 18 * 60).toBe(false);
    }
  });
});

describe("cancelScheduledReminder", () => {
  it("cancels every id recorded on the reminder", async () => {
    await cancelScheduledReminder(reminder({ scheduledNotificationIds: ["a", "b", "c"] }));

    expect(mocks.cancelScheduledNotificationAsync.mock.calls.map((call) => call[0])).toEqual(["a", "b", "c"]);
  });

  it("does nothing when the reminder was never scheduled", async () => {
    await cancelScheduledReminder(reminder());

    expect(mocks.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
  });
});
