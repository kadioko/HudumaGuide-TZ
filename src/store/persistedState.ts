import { NotificationPreferences, SecurityPreferences, SyncQueueItem } from "@/types";

export const STORE_VERSION = 2;

const migratedNotificationPreferences: NotificationPreferences = {
  quietHoursEnabled: true,
  quietHoursStart: "21:00",
  quietHoursEnd: "07:00",
  defaultPreReminderDays: [7, 1],
  permissionEducationSeen: false
};

export type VersionedPersistedState = {
  schemaVersion?: number;
  syncQueue?: SyncQueueItem[];
  feedbackReports?: unknown[];
  securityPreferences?: SecurityPreferences;
  notificationPreferences?: NotificationPreferences;
  [key: string]: unknown;
};

export function migratePersistedState(state: VersionedPersistedState) {
  if ((state.schemaVersion ?? 1) >= STORE_VERSION) {
    return state;
  }

  return {
    ...state,
    schemaVersion: STORE_VERSION,
    syncQueue: state.syncQueue ?? [],
    feedbackReports: state.feedbackReports ?? [],
    screenLanguages: state.screenLanguages ?? {},
    securityPreferences: state.securityPreferences ?? { biometricLockEnabled: false },
    notificationPreferences: state.notificationPreferences ?? migratedNotificationPreferences
  };
}
