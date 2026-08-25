import { afterEach, describe, expect, it, vi } from "vitest";
import { freelancerFixtureAnswers, retailShopFixtureAnswers } from "@/data/testFixtures";
import { BusinessPlan, BusinessWizardAnswers } from "@/types";
import { createBusinessComplianceReminders, getBusinessCostItems } from "@/utils/businessCompliance";
import { createBusinessPlan } from "@/utils/businessRoadmap";

function plan(answers: BusinessWizardAnswers): BusinessPlan {
  return { ...createBusinessPlan(answers, "Duka Bora", "Beta User"), id: "plan-1" };
}

const freelancer = plan(freelancerFixtureAnswers);
const retailShop = plan(retailShopFixtureAnswers);

const ids = (items: { id: string }[]) => items.map((item) => item.id);

afterEach(() => {
  vi.useRealTimers();
});

describe("business cost items", () => {
  it("always plans for registration and record keeping", () => {
    expect(ids(getBusinessCostItems(freelancer))).toEqual(expect.arrayContaining(["registration", "records"]));
  });

  it("adds a TIN bucket only when the owner does not have one", () => {
    expect(ids(getBusinessCostItems(freelancer))).toContain("tin");

    const withTin = plan({ ...freelancerFixtureAnswers, hasTin: true });
    expect(ids(getBusinessCostItems(withTin))).not.toContain("tin");
  });

  it("adds a licence bucket for either a licence need or a physical location", () => {
    expect(ids(getBusinessCostItems(retailShop))).toContain("licence");

    const locationOnly = plan({ ...freelancerFixtureAnswers, needsLicence: false, needsPhysicalLocation: true });
    expect(ids(getBusinessCostItems(locationOnly))).toContain("licence");

    expect(ids(getBusinessCostItems(freelancer))).not.toContain("licence");
  });

  it("adds EFD and employee buckets only when the wizard asked for them", () => {
    expect(ids(getBusinessCostItems(retailShop))).toEqual(expect.arrayContaining(["efd", "employees"]));
    expect(ids(getBusinessCostItems(freelancer))).not.toContain("efd");
    expect(ids(getBusinessCostItems(freelancer))).not.toContain("employees");
  });

  it("gives every bucket both languages, since cost copy is user-facing", () => {
    for (const item of getBusinessCostItems(retailShop)) {
      expect(item.titleSw, `${item.id} title`).toBeTruthy();
      expect(item.titleEn, `${item.id} title`).toBeTruthy();
      expect(item.noteSw, `${item.id} note`).toBeTruthy();
      expect(item.noteEn, `${item.id} note`).toBeTruthy();
    }
  });
});

describe("business compliance reminders", () => {
  it("always creates a records reminder linked to the plan", () => {
    const reminders = createBusinessComplianceReminders(freelancer);
    const records = reminders.find((reminder) => reminder.category === "business");

    expect(records).toBeDefined();
    expect(records?.linkedBusinessPlanId).toBe("plan-1");
    expect(records?.repeat).toBe("monthly");
    expect(records?.title).toContain("Duka Bora");
  });

  it("creates tax and licence reminders only when the plan calls for them", () => {
    const full = createBusinessComplianceReminders(retailShop).map((reminder) => reminder.category);
    expect(full).toEqual(expect.arrayContaining(["business", "tax", "licence"]));

    const minimal = plan({
      ...freelancerFixtureAnswers,
      needsTaxReminders: false,
      needsLicence: false,
      needsPhysicalLocation: false
    });
    expect(createBusinessComplianceReminders(minimal).map((reminder) => reminder.category)).toEqual(["business"]);
  });

  it("gives every reminder a unique id", () => {
    const ids = createBusinessComplianceReminders(retailShop).map((reminder) => reminder.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps tax guidance non-authoritative", () => {
    const tax = createBusinessComplianceReminders(retailShop).find((reminder) => reminder.category === "tax");
    expect(tax?.notes).toMatch(/confirm/i);
  });

  it("does not let the time of day shift the due date", () => {
    // Regression: due dates were built from the local calendar but serialised
    // with toISOString(), so a plan created after midnight in UTC+3 landed a
    // day early. Comparing two times on the same local day catches the shift in
    // either direction regardless of the machine's timezone.
    const dueDates = (hour: number, minute: number) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 4, 20, hour, minute));
      const result = createBusinessComplianceReminders(retailShop).map((reminder) => reminder.date);
      vi.useRealTimers();
      return result;
    };

    expect(dueDates(0, 30)).toEqual(dueDates(12, 0));
    expect(dueDates(23, 30)).toEqual(dueDates(12, 0));
  });

  it("schedules reminders in the future relative to the plan date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 20, 12, 0));

    for (const reminder of createBusinessComplianceReminders(retailShop)) {
      expect(reminder.date > "2026-05-20", `${reminder.category} is not in the future`).toBe(true);
    }
  });
});
