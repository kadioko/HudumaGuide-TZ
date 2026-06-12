import { describe, expect, it } from "vitest";
import { getSyncConflictReasons, mergeRemoteWithLocal, upsertSyncQueueItem } from "@/utils/syncMerge";
import { BusinessPlan, FeedbackReport, Reminder, UserDocument } from "@/types";

const localReminder: Reminder = {
  id: "reminder-1",
  title: "Local title",
  category: "tax",
  date: "2026-06-10",
  repeat: "none",
  notificationEnabled: true,
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-10T00:00:00.000Z"
};

const remoteReminder: Reminder = {
  ...localReminder,
  title: "Remote title",
  updatedAt: "2026-06-09T00:00:00.000Z"
};

const localDocument: UserDocument = {
  id: "document-1",
  title: "Local passport",
  documentType: "Passport",
  folder: "Personal Documents",
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-12T00:00:00.000Z"
};

const remoteDocument: UserDocument = {
  ...localDocument,
  title: "Remote passport",
  updatedAt: "2026-06-11T00:00:00.000Z"
};

const businessPlan: BusinessPlan = {
  id: "plan-1",
  businessName: "Mama Lishe",
  ownerName: "Asha",
  structure: "sole_trader",
  industry: "Food",
  city: "Dar es Salaam",
  answers: {
    businessIdea: "Food kiosk",
    ownership: "alone",
    preferredStructure: "sole_trader",
    hasNida: true,
    hasTin: false,
    hasAddress: true,
    needsPhysicalLocation: true,
    industry: "Food",
    expectsEmployees: false,
    needsLicence: true,
    needsEfd: false,
    needsTaxReminders: true,
    city: "Dar es Salaam"
  },
  roadmap: [],
  completedStepIds: [],
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z"
};

const feedbackReport: FeedbackReport = {
  id: "feedback-1",
  category: "outdated_info",
  message: "Needs review",
  createdAt: "2026-06-10T00:00:00.000Z"
};

describe("sync merge helpers", () => {
  it("keeps local edits when they are newer than remote records", () => {
    const merged = mergeRemoteWithLocal(
      {
        savedGuideSlugs: ["nida"],
        checklistItemsByGuide: { nida: ["doc-id"] },
        reminders: [remoteReminder],
        userDocuments: [remoteDocument],
        businessPlans: [],
        feedbackReports: []
      },
      {
        savedGuideSlugs: ["tin"],
        checklistItemsByGuide: { nida: ["step-apply"], tin: ["doc-tin"] },
        reminders: [localReminder],
        userDocuments: [localDocument],
        businessPlans: [businessPlan],
        feedbackReports: [feedbackReport]
      }
    );

    expect(merged.savedGuideSlugs).toEqual(["tin", "nida"]);
    expect(merged.checklistItemsByGuide.nida).toEqual(["step-apply", "doc-id"]);
    expect(merged.reminders[0].title).toBe("Local title");
    expect(merged.userDocuments[0].title).toBe("Local passport");
    expect(merged.businessPlans).toHaveLength(1);
    expect(merged.feedbackReports[0].id).toBe("feedback-1");
  });

  it("increments pending sync attempts instead of creating duplicate queue entries", () => {
    const first = upsertSyncQueueItem([], "network down", new Date("2026-06-10T00:00:00.000Z"));
    const second = upsertSyncQueueItem(first, "still down", new Date("2026-06-10T00:01:00.000Z"));

    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);
    expect(second[0]).toMatchObject({ attempts: 2, lastError: "still down" });
  });

  it("reports timestamp conflicts between matching remote and local records", () => {
    expect(
      getSyncConflictReasons(
        {
          savedGuideSlugs: [],
          checklistItemsByGuide: {},
          reminders: [remoteReminder],
          userDocuments: [],
          businessPlans: [],
          feedbackReports: []
        },
        {
          savedGuideSlugs: [],
          checklistItemsByGuide: {},
          reminders: [localReminder],
          userDocuments: [],
          businessPlans: [],
          feedbackReports: []
        }
      )[0]
    ).toContain("Remote reminder reminder-1 differed");
  });
});
