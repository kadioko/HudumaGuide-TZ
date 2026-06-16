import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getCurrentSession, loadRemoteUserData, saveRemoteUserData, signOut, updateProfile } from "@/services/accountService";
import { trackAnalyticsEvent } from "@/services/analyticsService";
import { cachePublishedGuides } from "@/services/offlineGuideService";
import { defaultNotificationPreferences } from "@/services/reminderService";
import { reportRuntimeIssue } from "@/services/runtimeLogger";
import { migratePersistedState, STORE_VERSION, VersionedPersistedState } from "@/store/persistedState";
import {
  BusinessPlan,
  FeedbackReport,
  Language,
  NotificationPreferences,
  OfflineGuideCacheMeta,
  OnboardingPersona,
  Reminder,
  SecurityPreferences,
  SyncDomain,
  SyncQueueItem,
  SyncStatus,
  UserDocument,
  UserProfile
} from "@/types";
import { ChecklistState, getSyncConflictReasons, mergeRemoteWithLocal, upsertSyncQueueItem } from "@/utils/syncMerge";

const STORAGE_KEY = "hudumaguide-tz-store";
const SYNC_DEBOUNCE_MS = 900;
const canUseDeviceStorage = Platform.OS !== "web" || typeof window !== "undefined";

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
  onboardingPersona?: OnboardingPersona;
  language: Language;
  screenLanguages: Record<string, Language>;
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
  resolveSyncQueueItem: (id: string) => void;
  logout: () => Promise<void>;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  setLowDataMode: (enabled: boolean) => void;
  updateNotificationPreferences: (preferences: NotificationPreferences) => void;
  updateSecurityPreferences: (preferences: SecurityPreferences) => void;
  refreshOfflineGuideCache: () => Promise<void>;
  clearUserData: () => void;
  completeOnboarding: (persona?: OnboardingPersona) => void;
  setLanguage: (language: Language) => void;
  setScreenLanguage: (screenKey: string, language: Language) => void;
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
  | "onboardingPersona"
  | "savedGuideSlugs"
  | "screenLanguages"
  | "checklistItemsByGuide"
  | "recentGuideSlugs"
  | "reminders"
  | "userDocuments"
  | "businessPlans"
  | "feedbackReports"
> & {
  schemaVersion: number;
};

function getPersistedState(state: AppState): PersistedState {
  return {
    schemaVersion: STORE_VERSION,
    language: state.language,
    userProfile: state.userProfile,
    syncQueue: state.syncQueue,
    lastRemoteSyncAt: state.lastRemoteSyncAt,
    lowDataMode: state.lowDataMode,
    offlineGuideCache: state.offlineGuideCache,
    notificationPreferences: state.notificationPreferences,
    securityPreferences: state.securityPreferences,
    hasCompletedOnboarding: state.hasCompletedOnboarding,
    onboardingPersona: state.onboardingPersona,
    savedGuideSlugs: state.savedGuideSlugs,
    screenLanguages: state.screenLanguages,
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
  onboardingPersona: undefined,
  language: "sw",
  screenLanguages: {},
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
      const currentState = get();
      const merged = mergeRemoteWithLocal(remote, currentState);
      const conflictReasons = getSyncConflictReasons(remote, currentState);
      const now = new Date().toISOString();
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
        lastRemoteSyncAt: now,
        syncQueue: conflictReasons.map((reason, index) => ({
          id: `conflict-${Date.now()}-${index}`,
          reason,
          queuedAt: now,
          attempts: 0,
          domains: getSyncDomainsFromReason(reason)
        })),
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
  resolveSyncQueueItem: (id) =>
    set((state) => ({
      syncQueue: state.syncQueue.filter((item) => item.id !== id),
      syncError: state.syncQueue.length <= 1 ? undefined : state.syncError,
      syncStatus: state.syncQueue.length <= 1 ? "local" : state.syncStatus
    })),
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
  completeOnboarding: (onboardingPersona) => set({ hasCompletedOnboarding: true, onboardingPersona }),
  setLanguage: (language) =>
    set((state) => {
      void trackAnalyticsEvent("language_changed", { language }, state.userProfile?.id);
      return {
        language,
        userProfile: state.userProfile ? { ...state.userProfile, preferredLanguage: language } : state.userProfile
      };
    }),
  setScreenLanguage: (screenKey, language) =>
    set((state) => ({
      screenLanguages: {
        ...state.screenLanguages,
        [screenKey]: language
      }
    })),
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

if (canUseDeviceStorage) {
  AsyncStorage.getItem(STORAGE_KEY)
    .then((value) => {
      if (value) {
        useAppStore.setState(migratePersistedState(JSON.parse(value) as VersionedPersistedState) as Partial<AppState>);
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
} else {
  isHydrating = false;
}

useAppStore.subscribe((state) => {
  if (isHydrating) {
    return;
  }

  if (canUseDeviceStorage) {
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(getPersistedState(state)));
  }
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
    reportRuntimeIssue("remote-sync", error, { queueLength: state.syncQueue.length });
    useAppStore.setState((current) => ({
      syncStatus: "error",
      syncError: message,
      syncQueue: upsertSyncQueueItem(current.syncQueue, message)
    }));
  } finally {
    isSyncingRemote = false;
  }
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

function getSyncDomainsFromReason(reason: string): SyncDomain[] {
  const lower = reason.toLowerCase();
  if (lower.includes("reminder")) {
    return ["reminders"];
  }
  if (lower.includes("document")) {
    return ["documents"];
  }
  if (lower.includes("business")) {
    return ["business_plans"];
  }
  if (lower.includes("checklist")) {
    return ["checklists"];
  }
  if (lower.includes("guide")) {
    return ["saved_guides"];
  }

  return ["saved_guides", "checklists", "reminders", "documents", "business_plans"];
}
