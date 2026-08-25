import { describe, expect, it } from "vitest";
import { freelancerFixtureAnswers, retailShopFixtureAnswers } from "@/data/testFixtures";
import { BusinessWizardAnswers } from "@/types";
import { createBusinessPlan, generateBusinessRoadmap } from "@/utils/businessRoadmap";

const stepIds = (answers: BusinessWizardAnswers) => generateBusinessRoadmap(answers).map((step) => step.id);

describe("business roadmap", () => {
  it("skips the NIDA step when the owner already has one", () => {
    expect(stepIds(freelancerFixtureAnswers)).not.toContain("prepare-nida");
    expect(stepIds({ ...freelancerFixtureAnswers, hasNida: false })).toContain("prepare-nida");
  });

  it("puts NIDA first when it is needed, since later steps depend on it", () => {
    expect(stepIds({ ...freelancerFixtureAnswers, hasNida: false })[0]).toBe("prepare-nida");
  });

  it("always includes structure choice and record separation", () => {
    for (const answers of [freelancerFixtureAnswers, retailShopFixtureAnswers]) {
      expect(stepIds(answers)).toEqual(expect.arrayContaining(["choose-structure", "records"]));
    }
  });

  it("routes company registration by preferred structure", () => {
    expect(stepIds({ ...freelancerFixtureAnswers, preferredStructure: "limited_company" })).toContain(
      "register-company"
    );
    expect(stepIds({ ...freelancerFixtureAnswers, preferredStructure: "business_name" })).toContain(
      "register-business-name"
    );
    expect(stepIds({ ...freelancerFixtureAnswers, preferredStructure: "partnership" })).toContain(
      "prepare-entity-docs"
    );
  });

  it("adds a licence step for food businesses even without an explicit licence answer", () => {
    const foodVendor: BusinessWizardAnswers = {
      ...freelancerFixtureAnswers,
      needsLicence: false,
      needsPhysicalLocation: false,
      industry: "Food and catering"
    };

    expect(stepIds(foodVendor)).toContain("business-licence");
  });

  it("matches the food industry regardless of casing", () => {
    expect(
      stepIds({
        ...freelancerFixtureAnswers,
        needsLicence: false,
        needsPhysicalLocation: false,
        industry: "FOOD PROCESSING"
      })
    ).toContain("business-licence");
  });

  it("adds TIN and address steps only when those are missing", () => {
    expect(stepIds(freelancerFixtureAnswers)).toContain("get-tin");
    expect(stepIds({ ...freelancerFixtureAnswers, hasTin: true })).not.toContain("get-tin");

    expect(stepIds(retailShopFixtureAnswers)).toContain("business-address");
    expect(stepIds({ ...retailShopFixtureAnswers, hasAddress: true })).not.toContain("business-address");
  });

  it("gives every step both languages and a unique id", () => {
    const steps = generateBusinessRoadmap(retailShopFixtureAnswers);
    const ids = steps.map((step) => step.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const step of steps) {
      expect(step.titleSw, `${step.id} title`).toBeTruthy();
      expect(step.titleEn, `${step.id} title`).toBeTruthy();
      expect(step.descriptionSw, `${step.id} description`).toBeTruthy();
      expect(step.descriptionEn, `${step.id} description`).toBeTruthy();
    }
  });

  it("only links steps to guides that exist", async () => {
    const { serviceGuides } = await import("@/data/serviceGuides");
    const knownSlugs = new Set(serviceGuides.map((guide) => guide.slug));

    for (const answers of [freelancerFixtureAnswers, retailShopFixtureAnswers]) {
      for (const step of generateBusinessRoadmap(answers)) {
        if (step.linkedServiceSlug) {
          expect(knownSlugs, `${step.id} links to a missing guide`).toContain(step.linkedServiceSlug);
        }
      }
    }
  });
});

describe("createBusinessPlan", () => {
  it("seeds status fields from the wizard answers", () => {
    const plan = createBusinessPlan(retailShopFixtureAnswers, "Duka Bora", "Beta User");

    expect(plan.registrationStatus).toBe("planning");
    expect(plan.tinStatus).toBe("needed");
    expect(plan.licenceStatus).toBe("needed");

    const settled = createBusinessPlan(
      { ...retailShopFixtureAnswers, hasTin: true, needsLicence: false },
      "Duka Bora",
      "Beta User"
    );
    expect(settled.tinStatus).toBe("active");
    expect(settled.licenceStatus).toBe("not_needed");
  });

  it("starts with an empty progress state", () => {
    const plan = createBusinessPlan(freelancerFixtureAnswers, "Kazi Digital", "Beta User");

    expect(plan.completedStepIds).toEqual([]);
    expect(plan.costEstimates).toEqual([]);
    expect(plan.roadmapStepNotes).toEqual({});
    expect(plan.roadmap.length).toBeGreaterThan(0);
  });

  it("carries the entered name and owner through", () => {
    const plan = createBusinessPlan(freelancerFixtureAnswers, "Kazi Digital", "Asha");

    expect(plan.businessName).toBe("Kazi Digital");
    expect(plan.ownerName).toBe("Asha");
    expect(plan.structure).toBe(freelancerFixtureAnswers.preferredStructure);
  });
});
