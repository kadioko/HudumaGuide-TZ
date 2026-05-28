import { BusinessWizardAnswers, Reminder, UserDocument } from "@/types";
import { createBusinessPlan } from "@/utils/businessRoadmap";

export const coreGuideFixtureSlugs = [
  "nida-nin-application",
  "tin-registration",
  "business-name-registration",
  "business-licence-application",
  "tax-deadline-reminders"
];

export const freelancerFixtureAnswers: BusinessWizardAnswers = {
  businessIdea: "Consulting and digital services",
  ownership: "alone",
  preferredStructure: "freelancer",
  hasNida: true,
  hasTin: false,
  hasAddress: true,
  needsPhysicalLocation: false,
  industry: "Consultancy",
  expectsEmployees: false,
  needsLicence: false,
  needsEfd: false,
  needsTaxReminders: true,
  city: "Dar es Salaam"
};

export const retailShopFixtureAnswers: BusinessWizardAnswers = {
  businessIdea: "Small retail shop",
  ownership: "alone",
  preferredStructure: "business_name",
  hasNida: true,
  hasTin: false,
  hasAddress: false,
  needsPhysicalLocation: true,
  industry: "Retail",
  expectsEmployees: true,
  needsLicence: true,
  needsEfd: true,
  needsTaxReminders: true,
  city: "Mwanza"
};

export const businessPlanFixtures = [
  {
    ...createBusinessPlan(freelancerFixtureAnswers, "Kazi Digital Advisory", "Beta User One"),
    id: "fixture-plan-freelancer"
  },
  {
    ...createBusinessPlan(retailShopFixtureAnswers, "Duka Bora", "Beta User Two"),
    id: "fixture-plan-retail-shop"
  }
];

export const reminderFixtures: Reminder[] = [
  {
    id: "fixture-reminder-tax",
    title: "Confirm TRA tax deadline",
    category: "tax",
    date: "2026-06-15",
    repeat: "monthly",
    notes: "Confirm exact dates through official TRA channels.",
    notificationEnabled: false,
    createdAt: "2026-05-10T00:00:00.000Z"
  },
  {
    id: "fixture-reminder-licence",
    title: "Business licence follow-up",
    category: "licence",
    date: "2026-07-01",
    repeat: "yearly",
    notes: "Confirm local authority requirements before payment.",
    notificationEnabled: false,
    createdAt: "2026-05-10T00:00:00.000Z"
  }
];

export const documentFixtures: UserDocument[] = [
  {
    id: "fixture-document-nida",
    title: "NIDA copy",
    documentType: "NIDA/NIN",
    folder: "Personal Documents",
    reminderOn: "2026-06-01",
    notes: "Fixture record for sync and RLS testing.",
    createdAt: "2026-05-10T00:00:00.000Z",
    updatedAt: "2026-05-10T00:00:00.000Z"
  },
  {
    id: "fixture-document-business-licence",
    title: "Business licence reference",
    documentType: "Business licence",
    folder: "Licences",
    expiresOn: "2027-05-01",
    reminderOn: "2027-04-01",
    notes: "Fixture record for document vault beta testing.",
    createdAt: "2026-05-10T00:00:00.000Z",
    updatedAt: "2026-05-10T00:00:00.000Z"
  }
];
