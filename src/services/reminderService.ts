import * as Notifications from "expo-notifications";
import { Reminder } from "@/types";

export async function requestReminderPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleLocalReminder(reminder: Reminder) {
  if (!reminder.notificationEnabled) {
    return null;
  }

  const hasPermission = await requestReminderPermission();
  if (!hasPermission) {
    return null;
  }

  const triggerDate = new Date(reminder.date);
  if (Number.isNaN(triggerDate.getTime()) || triggerDate <= new Date()) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: reminder.title,
      body: reminder.notes || "HudumaGuide TZ reminder"
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate
    }
  });
}
