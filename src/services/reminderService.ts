import * as Notifications from "expo-notifications";
import { NotificationPreferences, Reminder } from "@/types";

export const defaultNotificationPreferences: NotificationPreferences = {
  quietHoursEnabled: true,
  quietHoursStart: "21:00",
  quietHoursEnd: "07:00",
  defaultPreReminderDays: [7, 1],
  permissionEducationSeen: false
};

export async function requestReminderPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

function parseTime(value: string) {
  const [hours = "0", minutes = "0"] = value.split(":");
  return { hours: Number(hours), minutes: Number(minutes) };
}

function isInsideQuietHours(date: Date, preferences: NotificationPreferences) {
  if (!preferences.quietHoursEnabled) {
    return false;
  }

  const start = parseTime(preferences.quietHoursStart);
  const end = parseTime(preferences.quietHoursEnd);
  const current = date.getHours() * 60 + date.getMinutes();
  const startMinutes = start.hours * 60 + start.minutes;
  const endMinutes = end.hours * 60 + end.minutes;

  if (startMinutes > endMinutes) {
    return current >= startMinutes || current < endMinutes;
  }

  return current >= startMinutes && current < endMinutes;
}

function moveOutOfQuietHours(date: Date, preferences: NotificationPreferences) {
  if (!isInsideQuietHours(date, preferences)) {
    return date;
  }

  const end = parseTime(preferences.quietHoursEnd);
  const next = new Date(date);
  next.setHours(end.hours, end.minutes, 0, 0);

  if (next <= date) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

function getNextOccurrence(date: Date, repeat: Reminder["repeat"]) {
  const next = new Date(date);
  const now = new Date();

  while (next <= now && repeat !== "none") {
    if (repeat === "weekly") {
      next.setDate(next.getDate() + 7);
    } else if (repeat === "monthly") {
      next.setMonth(next.getMonth() + 1);
    } else if (repeat === "yearly") {
      next.setFullYear(next.getFullYear() + 1);
    }
  }

  return next;
}

function getReminderTriggerDates(reminder: Reminder, preferences: NotificationPreferences) {
  const dueDate = getNextOccurrence(new Date(reminder.date), reminder.repeat);
  const preReminderDays = reminder.preReminderDays ?? preferences.defaultPreReminderDays;
  const dates = [
    ...preReminderDays.map((days) => {
      const date = new Date(dueDate);
      date.setDate(date.getDate() - days);
      return { date, label: `${days} day${days === 1 ? "" : "s"} before` };
    }),
    { date: dueDate, label: "Due today" }
  ];

  return dates
    .map((item) => ({ ...item, date: moveOutOfQuietHours(item.date, preferences) }))
    .filter((item) => !Number.isNaN(item.date.getTime()) && item.date > new Date());
}

export async function scheduleLocalReminder(reminder: Reminder, preferences = defaultNotificationPreferences) {
  if (!reminder.notificationEnabled) {
    return [];
  }

  const hasPermission = await requestReminderPermission();
  if (!hasPermission) {
    return [];
  }

  const triggers = getReminderTriggerDates(reminder, preferences);
  if (!triggers.length) {
    return [];
  }

  const ids: string[] = [];
  for (const trigger of triggers) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: `${trigger.label}. ${reminder.notes || "HudumaGuide TZ reminder"}`
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger.date
      }
    });
    ids.push(id);
  }

  return ids;
}

export async function cancelScheduledReminder(reminder: Reminder) {
  for (const id of reminder.scheduledNotificationIds ?? []) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}
