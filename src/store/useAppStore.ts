import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { BusinessPlan, FeedbackReport, Language, Reminder } from "@/types";

type ChecklistState = Record<string, string[]>;
const STORAGE_KEY = "hudumaguide-tz-store";

type AppState = {
  hasCompletedOnboarding: boolean;
  language: Language;
  savedGuideSlugs: string[];
  checklistItemsByGuide: ChecklistState;
  recentGuideSlugs: string[];
  reminders: Reminder[];
  businessPlans: BusinessPlan[];
  feedbackReports: FeedbackReport[];
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
  addBusinessPlan: (plan: BusinessPlan) => void;
  toggleBusinessRoadmapStep: (planId: string, stepId: string) => void;
  addFeedbackReport: (report: FeedbackReport) => void;
};

type PersistedState = Pick<
  AppState,
  | "language"
  | "hasCompletedOnboarding"
  | "savedGuideSlugs"
  | "checklistItemsByGuide"
  | "recentGuideSlugs"
  | "reminders"
  | "businessPlans"
  | "feedbackReports"
>;

function getPersistedState(state: AppState): PersistedState {
  return {
    language: state.language,
    hasCompletedOnboarding: state.hasCompletedOnboarding,
    savedGuideSlugs: state.savedGuideSlugs,
    checklistItemsByGuide: state.checklistItemsByGuide,
    recentGuideSlugs: state.recentGuideSlugs,
    reminders: state.reminders,
    businessPlans: state.businessPlans,
    feedbackReports: state.feedbackReports
  };
}

export const useAppStore = create<AppState>()((set, get) => ({
  hasCompletedOnboarding: false,
  language: "sw",
  savedGuideSlugs: [],
  checklistItemsByGuide: {},
  recentGuideSlugs: [],
  reminders: [],
  businessPlans: [],
  feedbackReports: [],
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
  setLanguage: (language) => set({ language }),
  saveGuide: (slug) =>
    set((state) => ({
      savedGuideSlugs: state.savedGuideSlugs.includes(slug) ? state.savedGuideSlugs : [slug, ...state.savedGuideSlugs]
    })),
  unsaveGuide: (slug) =>
    set((state) => ({
      savedGuideSlugs: state.savedGuideSlugs.filter((item) => item !== slug)
    })),
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
    set((state) => ({
      reminders: [...state.reminders, reminder].sort((a, b) => a.date.localeCompare(b.date))
    })),
  deleteReminder: (id) =>
    set((state) => ({
      reminders: state.reminders.filter((item) => item.id !== id)
    })),
  addBusinessPlan: (plan) =>
    set((state) => ({
      businessPlans: [plan, ...state.businessPlans]
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

        return { ...plan, completedStepIds: completed };
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
  })
  .catch(() => {
    isHydrating = false;
  });

useAppStore.subscribe((state) => {
  if (isHydrating) {
    return;
  }

  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(getPersistedState(state)));
});
