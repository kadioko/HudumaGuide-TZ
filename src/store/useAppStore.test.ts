import { describe, expect, it } from "vitest";
import { migratePersistedState } from "@/store/persistedState";

describe("store persistence migration", () => {
  it("fills fields expected by the current persisted schema", () => {
    const migrated = migratePersistedState({
      schemaVersion: 1,
      language: "sw",
      savedGuideSlugs: [],
      checklistItemsByGuide: {},
      recentGuideSlugs: [],
      reminders: [],
      userDocuments: [],
      businessPlans: []
    } as never);

    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.syncQueue).toEqual([]);
    expect(migrated.feedbackReports).toEqual([]);
    expect(migrated.securityPreferences).toEqual({ biometricLockEnabled: false });
  });

  it("preserves real old local data while adding newer persisted fields", () => {
    const migrated = migratePersistedState({
      schemaVersion: 1,
      language: "en",
      savedGuideSlugs: ["nida-nin-application"],
      checklistItemsByGuide: { "nida-nin-application": ["doc-birth-cert"] },
      recentGuideSlugs: ["tin-registration"],
      reminders: [
        {
          id: "reminder-1",
          title: "Renew licence",
          category: "driving",
          date: "2026-08-01",
          repeat: "none",
          notificationEnabled: true,
          createdAt: "2026-06-01T00:00:00.000Z"
        }
      ],
      userDocuments: [
        {
          id: "doc-1",
          title: "Passport",
          documentType: "Passport",
          folder: "Personal Documents",
          createdAt: "2026-06-01T00:00:00.000Z",
          updatedAt: "2026-06-01T00:00:00.000Z"
        }
      ],
      businessPlans: []
    } as never);

    expect(migrated.savedGuideSlugs).toEqual(["nida-nin-application"]);
    expect(migrated.reminders).toHaveLength(1);
    expect(migrated.userDocuments).toHaveLength(1);
    expect(migrated.screenLanguages).toEqual({});
    expect(migrated.feedbackReports).toEqual([]);
  });
});
