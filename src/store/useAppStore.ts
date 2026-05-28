import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getCurrentSession, loadRemoteUserData, saveRemoteUserData, signOut, updateProfile } from "@/services/accountService";
import { trackAnalyticsEvent } from "@/services/analyticsService";
import { cachePublishedGuides } from "@/services/offlineGuideService";
import { defaultNotificationPreferences } from "@/services/reminderService";
import {
  BusinessPlan,
  FeedbackReport,
  Language,
  NotificationPreferences,
  OfflineGuideCacheMeta,
  Reminder,
  SecurityPreferences,
  SyncQueueItem,
  SyncStatus,
  UserDocument,
  UserProfile
} from "@/types";

type ChecklistState = Record<string, string[]>;
const STORAGE_KEY = "hudumaguide-tz-store";
const SYNC_DEBOUNCE_MS = 900;

type AppState = {
  isHydrated: boolean;
  authLoading: boolean;
  syncStatus: SyncStatus;
  syncError?: string;
  syncQueue: SyncQueueItem[];
  lastRemoteSyncAt?: string;
  lowDataMode: boolean;
  offlineGuideCache?: OfflineGuideCacheMeta;
  notificationPreferences: NotificationPreferences;
  securityPreferences: SecurityPreferences;
  userProfile?: UserProfile;
  hasCompletedOnboarding: boolean;
  language: Language;
  savedGuideSlugs: string[];
  checklistItemsByGuide: ChecklistState;
  recentGuideSlugs: string[];
  reminders: Reminder[];
  userDocuments: UserDocument[];
  businessPlans: BusinessPlan[];
  feedbackReports: FeedbackReport[];
  hydrateSession: () => Promise<void>;
  setAuthLoading: (loading: boolean) => void;
  setUserProfile: (profile?: UserProfile) => void;
  refreshRemoteData: () => Promise<void>;
  syncNow: () => Promise<void>;
  retryQueuedSync: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  setLowDataMode: (enabled: boolean) => void;
  updateNotificationPreferences: (preferences: NotificationPreferences) => void;
  updateSecurityPreferences: (preferences: SecurityPreferences) => void;
  refreshOfflineGuideCache: () => Promise<void>;
  clearUserData: () => void;
  completeOnboarding: () => void;
  setLanguage: (language: Language) => void;
  saveGuide: (slug: string) => void;
  unsaveGuide: (slug: string) => void;
  toggleGuideSaved: (slug: string) => void;
  addRecentGuide: (slug: string) => void;
  toggleChecklistItem: (guideSlug: string, itemId: string) => void;
  isChecklistItemDone: (guideSlug: string, itemId: string) => boolean;
  addReminder: (reminder: Reminder) => void;
  deleteReminder: (id: string) => void;
  addDocument: (document: UserDocument) => void;
  deleteDocument: (id: string) => void;
  updateDocument: (document: UserDocument) => void;
  addBusinessPlan: (plan: BusinessPlan) => void;
  updateBusinessPlan: (plan: BusinessPlan) => void;
  toggleBusinessRoadmapStep: (planId: string, stepId: string) => void;
  updateBusinessRoadmapStepNote: (planId: string, stepId: string, note: string) => void;
  addFeedbackReport: (report: FeedbackReport) => void;
};

type PersistedState = Pick<
  AppState,
  | "language"
  | "userProfile"
  | "syncQueue"
  | "lastRemoteSyncAt"
  | "lowDataMode"
  | "offlineGuideCache"
  | "notificationPreferences"
  | "securityPreferences"
  | "hasCompletedOnboarding"
  | "savedGuideSlugs"
  | "checklistItemsByGuide"
  | "recentGuideSlugs"
  | "reminders"
  | "userDocuments"
  | "businessPlans"
  | "feedbackReports"
>;

function getPersistedState(state: AppState): PersistedState {
  return {
    language: state.language,
    userProfile: state.userProfile,
    syncQueue: state.syncQueue,
    lastRemoteSyncAt: state.lastRemoteSyncAt,
    lowDataMode: state.lowDataMode,
    offlineGuideCache: state.offlineGuideCache,
    notificationPreferences: state.notificationPreferences,
    securityPreferences: state.securityPreferences,
    hasCompletedOnboarding: state.hasCompletedOnboarding,
    savedGuideSlugs: state.savedGuideSlugs,
    checklistItemsByGuide: state.checklistItemsByGuide,
    recentGuideSlugs: state.recentGuideSlugs,
    reminders: state.reminders,
    userDocuments: state.userDocuments,
    businessPlans: state.businessPlans,
    feedbackReports: state.feedbackReports
  };
}

export const useAppStore = create<AppState>()((set, get) => ({
  isHydrated: false,
  authLoading: false,
  syncStatus: "local",
  syncError: undefined,
  syncQueue: [],
  lastRemoteSyncAt: undefined,
  lowDataMode: false,
  offlineGuideCache: undefined,
  notificationPreferences: defaultNotificationPreferences,
  securityPreferences: { biometricLockEnabled: false },
  userProfile: undefined,
  hasCompletedOnboarding: false,
  language: "sw",
  savedGuideSlugs: [],
  checklistItemsByGuide: {},
  recentGuideSlugs: [],
  reminders: [],
  userDocuments: [],
  businessPlans: [],
  feedbackReports: [],
  hydrateSession: async () => {
    if (!isSupabaseConfigured) {
      set({ authLoading: false, syncStatus: "local" });
      return;
    }

    set({ authLoading: true, syncStatus: "syncing", syncError: undefined });
    try {
      const session = await getCurrentSession();
      if (!session?.user) {
        set({ authLoading: false, syncStatus: "local", userProfile: undefined });
        return;
      }

      const remote = await loadRemoteUserData(session.user.id, session.user.email, get().language);
      const merged = mergeRemoteWithLocal(remote, get());
      set({
        userProfile: remote.profile,
        language: remote.profile.preferredLanguage,
        savedGuideSlugs: merged.savedGuideSlugs,
        checklistItemsByGuide: merged.checklistItemsByGuide,
        reminders: merged.reminders,
        userDocuments: merged.userDocuments,
        businessPlans: merged.businessPlans,
        authLoading: false,
        syncStatus: "synced",
        syncError: undefined,
        lastRemoteSyncAt: new Date().toISOString(),
        syncQueue: [],
        feedbackReports: merged.feedbackReports
      });

      scheduleRemoteSync();
    } catch (error) {
      set({ authLoading: false, syncStatus: "error", syncError: getErrorMessage(error) });
    }
  },
  setAuthLoading: (authLoading) => set({ authLoading }),
  setUserProfile: (userProfile) => set({ userProfile }),
  refreshRemoteData: async () => {
    await get().hydrateSession();
  },
  syncNow: async () => {
    await syncRemoteState();
  },
  retryQueuedSync: async () => {
    await syncRemoteState();
  },
  logout: async () => {
    if (isSupabaseConfigured) {
      await signOut();
    }
    set({ userProfile: undefined, syncStatus: "local", syncError: undefined });
  },
  updateUserProfile: async (profile) => {
    set({ userProfile: profile, language: profile.preferredLanguage, syncStatus: "syncing", syncError: undefined });

    if (!isSupabaseConfigured) {
      set({ syncStatus: "local" });
      return;
    }

    try {
      const saved = await updateProfile(profile);
      set({ userProfile: saved, language: saved.preferredLanguage, syncStatus: "synced" });
    } catch (error) {
      set({ syncStatus: "error", syncError: getErrorMessage(error) });
    }
  },
  setLowDataMode: (lowDataMode) => set({ lowDataMode }),
  updateNotificationPreferences: (notificationPreferences) => set({ notificationPreferences }),
  updateSecurityPreferences: (securityPreferences) => set({ securityPreferences }),
  refreshOfflineGuideCache: async () => {
    const meta = await cachePublishedGuides(get().savedGuideSlugs);
    set({ offlineGuideCache: meta });
  },
  clearUserData: () =>
    set({
      savedGuideSlugs: [],
      checklistItemsByGuide: {},
      recentGuideSlugs: [],
      reminders: [],
      userDocuments: [],
      businessPlans: [],
      feedbackReports: [],
      userProfile: undefined,
      syncQueue: [],
      syncStatus: "local",
      syncError: undefined
    }),
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
  setLanguage: (language) =>
    set((state) => {
      void trackAnalyticsEvent("language_changed", { language }, state.userProfile?.id);
      return {
        language,
        userProfile: state.userProfile ? { ...state.userProfile, preferredLanguage: language } : state.userProfile
      };
    }),
  saveGuide: (slug) =>
    set((state) => {
      const savedGuideSlugs = state.savedGuideSlugs.includes(slug) ? state.savedGuideSlugs : [slug, ...state.savedGuideSlugs];
      void cachePublishedGuides(savedGuideSlugs).then((offlineGuideCache) => useAppStore.setState({ offlineGuideCache }));
      void trackAnalyticsEvent("guide_saved", { guideSlug: slug, language: state.language }, state.userProfile?.id);
      return { savedGuideSlugs };
    }),
  unsaveGuide: (slug) =>
    set((state) => {
      const savedGuideSlugs = state.savedGuideSlugs.filter((item) => item !== slug);
      void cachePublishedGuides(savedGuideSlugs).then((offlineGuideCache) => useAppStore.setState({ offlineGuideCache }));
      return { savedGuideSlugs };
    }),
  toggleGuideSaved: (slug) => {
    const isSaved = get().savedGuideSlugs.includes(slug);
    if (isSaved) {
      get().unsaveGuide(slug);
    } else {
      get().saveGuide(slug);
    }
  },
  addRecentGuide: (slug) =>
    set((state) => {
      if (state.recentGuideSlugs[0] === slug) {
        return state;
      }

      return {
        recentGuideSlugs: [slug, ...state.recentGuideSlugs.filter((item) => item !== slug)].slice(0, 5)
      };
    }),
  toggleChecklistItem: (guideSlug, itemId) =>
    set((state) => {
      const currentItems = state.checklistItemsByGuide[guideSlug] ?? [];
      const nextItems = currentItems.includes(itemId)
        ? currentItems.filter((item) => item !== itemId)
        : [...currentItems, itemId];

      return {
        checklistItemsByGuide: {
          ...state.checklistItemsByGuide,
          [guideSlug]: nextItems
        }
      };
    }),
  isChecklistItemDone: (guideSlug, itemId) => {
    return (get().checklistItemsByGuide[guideSlug] ?? []).includes(itemId);
  },
  addReminder: (reminder) =>
    set((state) => {
      void trackAnalyticsEvent(
        "reminder_created",
        { reminderCategory: reminder.category, language: state.language },
        state.userProfile?.id
      );

      return {
        reminders: [{ ...reminder, updatedAt: reminder.updatedAt ?? new Date().toISOString() }, ...state.reminders].sort((a, b) =>
          a.date.localeCompare(b.date)
        )
      };
    }),
  deleteReminder: (id) =>
    set((state) => ({
      reminders: state.reminders.filter((item) => item.id !== id)
    })),
  addDocument: (document) =>
    set((state) => ({
      userDocuments: [document, ...state.userDocuments]
    })),
  deleteDocument: (id) =>
    set((state) => ({
      userDocuments: state.userDocuments.filter((item) => item.id !== id),
      reminders: state.reminders.filter((item) => item.linkedDocumentId !== id)
    })),
  updateDocument: (document) =>
    set((state) => ({
      userDocuments: state.userDocuments.map((item) =>
        item.id === document.id ? { ...document, updatedAt: new Date().toISOString() } : item
      )
    })),
  addBusinessPlan: (plan) =>
    set((state) => ({
      businessPlans: [plan, ...state.businessPlans]
    })),
  updateBusinessPlan: (plan) =>
    set((state) => ({
      businessPlans: state.businessPlans.map((item) =>
        item.id === plan.id ? { ...plan, updatedAt: new Date().toISOString() } : item
      )
    })),
  toggleBusinessRoadmapStep: (planId, stepId) =>
    set((state) => ({
      businessPlans: state.businessPlans.map((plan) => {
        if (plan.id !== planId) {
          return plan;
        }

        const completed = plan.completedStepIds.includes(stepId)
          ? plan.completedStepIds.filter((item) => item !== stepId)
          : [...plan.completedStepIds, stepId];
        const completedAt = { ...(plan.roadmapStepCompletedAt ?? {}) };
        if (completed.includes(stepId)) {
          completedAt[stepId] = new Date().toISOString();
        } else {
          delete completedAt[stepId];
        }

        return { ...plan, completedStepIds: completed, roadmapStepCompletedAt: completedAt, updatedAt: new Date().toISOString() };
      })
    })),
  updateBusinessRoadmapStepNote: (planId, stepId, note) =>
    set((state) => ({
      businessPlans: state.businessPlans.map((plan) => {
        if (plan.id !== planId) {
          return plan;
        }

        return {
          ...plan,
          roadmapStepNotes: {
            ...(plan.roadmapStepNotes ?? {}),
            [stepId]: note
          },
          updatedAt: new Date().toISOString()
        };
      })
    })),
  addFeedbackReport: (report) =>
    set((state) => ({
      feedbackReports: [report, ...state.feedbackReports]
    }))
}));

let isHydrating = true;

AsyncStorage.getItem(STORAGE_KEY)
  .then((value) => {
    if (value) {
      useAppStore.setState(JSON.parse(value) as Partial<AppState>);
    }
  })
  .finally(() => {
    isHydrating = false;
    useAppStore.setState({ isHydrated: true });
    void useAppStore.getState().refreshOfflineGuideCache();
    void useAppStore.getState().hydrateSession();
  })
  .catch(() => {
    isHydrating = false;
    useAppStore.setState({ isHydrated: true });
    void useAppStore.getState().refreshOfflineGuideCache();
  });

useAppStore.subscribe((state) => {
  if (isHydrating) {
    return;
  }

  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(getPersistedState(state)));
  const nextPayload = getRemotePayloadKey(state);
  if (nextPayload !== lastRemotePayloadKey) {
    lastRemotePayloadKey = nextPayload;
    scheduleRemoteSync();
  }
});

let syncTimer: ReturnType<typeof setTimeout> | undefined;
let isSyncingRemote = false;
let lastRemotePayloadKey = "";

function scheduleRemoteSync() {
  if (!isSupabaseConfigured || isHydrating) {
    return;
  }

  if (syncTimer) {
    clearTimeout(syncTimer);
  }

  syncTimer = setTimeout(() => {
    void syncRemoteState();
  }, SYNC_DEBOUNCE_MS);
}

async function syncRemoteState() {
  const state = useAppStore.getState();
  const userId = state.userProfile?.id;

  if (!isSupabaseConfigured || !userId || isSyncingRemote) {
    return;
  }

  isSyncingRemote = true;
  useAppStore.setState({ syncStatus: "syncing", syncError: undefined });

  try {
    await saveRemoteUserData(userId, {
      language: state.language,
      savedGuideSlugs: state.savedGuideSlugs,
      checklistItemsByGuide: state.checklistItemsByGuide,
      reminders: state.reminders,
      userDocuments: state.userDocuments,
      businessPlans: state.businessPlans,
      feedbackReports: state.feedbackReports
    });
    useAppStore.setState({ syncStatus: "synced", syncError: undefined, syncQueue: [], lastRemoteSyncAt: new Date().toISOString() });
  } catch (error) {
    const message = getErrorMessage(error);
    useAppStore.setState((current) => ({
      syncStatus: "error",
      syncError: message,
      syncQueue: upsertSyncQueueItem(current.syncQueue, message)
    }));
  } finally {
    isSyncingRemote = false;
  }
}

function upsertSyncQueueItem(queue: SyncQueueItem[], error: string) {
  const current = queue[0];
  if (current) {
    return [{ ...current, attempts: current.attempts + 1, lastError: error }, ...queue.slice(1)];
  }

  return [
    {
      id: `sync-${Date.now()}`,
      reason: "Save latest local changes",
      queuedAt: new Date().toISOString(),
      attempts: 1,
      lastError: error
    }
  ];
}

function mergeRemoteWithLocal(remote: {
  savedGuideSlugs: string[];
  checklistItemsByGuide: ChecklistState;
  reminders: Reminder[];
  userDocuments: UserDocument[];
  businessPlans: BusinessPlan[];
  feedbackReports: FeedbackReport[];
}, local: AppState) {
  return {
    savedGuideSlugs: Array.from(new Set([...local.savedGuideSlugs, ...remote.savedGuideSlugs])),
    checklistItemsByGuide: mergeChecklistState(local.checklistItemsByGuide, remote.checklistItemsByGuide),
    reminders: mergeByUpdatedAt(local.reminders, remote.reminders),
    userDocuments: mergeByUpdatedAt(local.userDocuments, remote.userDocuments),
    businessPlans: mergeByUpdatedAt(local.businessPlans, remote.businessPlans),
    feedbackReports: mergeByCreatedAt(local.feedbackReports, remote.feedbackReports)
  };
}

function mergeChecklistState(local: ChecklistState, remote: ChecklistState) {
  const keys = Array.from(new Set([...Object.keys(local), ...Object.keys(remote)]));
  return keys.reduce<ChecklistState>((acc, key) => {
    acc[key] = Array.from(new Set([...(local[key] ?? []), ...(remote[key] ?? [])]));
    return acc;
  }, {});
}

function mergeByUpdatedAt<T extends { id: string; createdAt?: string; updatedAt?: string }>(localItems: T[], remoteItems: T[]) {
  const items = new Map<string, T>();
  for (const item of [...remoteItems, ...localItems]) {
    const current = items.get(item.id);
    if (!current) {
      items.set(item.id, item);
      continue;
    }

    const currentTime = new Date(current.updatedAt ?? current.createdAt ?? 0).getTime();
    const nextTime = new Date(item.updatedAt ?? item.createdAt ?? 0).getTime();
    if (nextTime >= currentTime) {
      items.set(item.id, item);
    }
  }

  return Array.from(items.values());
}

function mergeByCreatedAt<T extends { id: string; createdAt?: string }>(localItems: T[], remoteItems: T[]) {
  const items = new Map<string, T>();
  for (const item of [...remoteItems, ...localItems]) {
    items.set(item.id, item);
  }

  return Array.from(items.values()).sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while syncing.";
}

function getRemotePayloadKey(state: AppState) {
  return JSON.stringify({
    userId: state.userProfile?.id,
    language: state.language,
    savedGuideSlugs: state.savedGuideSlugs,
    checklistItemsByGuide: state.checklistItemsByGuide,
    reminders: state.reminders,
    userDocuments: state.userDocuments,
    businessPlans: state.businessPlans,
    feedbackReports: state.feedbackReports
  });
}
