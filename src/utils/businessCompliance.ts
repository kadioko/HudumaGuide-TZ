import { BusinessPlan, Reminder } from "@/types";

type CostItem = {
  id: string;
  titleSw: string;
  titleEn: string;
  noteSw: string;
  noteEn: string;
};

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getBusinessCostItems(plan: BusinessPlan): CostItem[] {
  const items: CostItem[] = [
    {
      id: "registration",
      titleSw: "Usajili",
      titleEn: "Registration",
      noteSw: "Andaa bajeti ya name search, usajili au nyaraka za kampuni. Hakiki ada rasmi kabla ya malipo.",
      noteEn: "Plan for name search, registration, or company documents. Confirm official fees before payment."
    },
    {
      id: "records",
      titleSw: "Rekodi na utunzaji wa risiti",
      titleEn: "Records and receipts",
      noteSw: "Tenga gharama/utaratibu wa kutunza risiti, mapato, matumizi na mikataba.",
      noteEn: "Plan how you will keep receipts, income, expenses, and contracts."
    }
  ];

  if (!plan.answers.hasTin) {
    items.push({
      id: "tin",
      titleSw: "TIN na kodi",
      titleEn: "TIN and tax",
      noteSw: "Hakiki mahitaji ya TIN na obligations za kodi kupitia chanzo rasmi au mtaalamu.",
      noteEn: "Confirm TIN requirements and tax obligations through official sources or a professional."
    });
  }

  if (plan.answers.needsLicence || plan.answers.needsPhysicalLocation) {
    items.push({
      id: "licence",
      titleSw: "Leseni na ukaguzi",
      titleEn: "Licence and inspections",
      noteSw: "Leseni hutegemea eneo na shughuli. Usitumie makadirio kama ada ya mwisho.",
      noteEn: "Licensing depends on location and activity. Do not treat estimates as final fees."
    });
  }

  if (plan.answers.needsEfd) {
    items.push({
      id: "efd",
      titleSw: "EFD/VFD",
      titleEn: "EFD/VFD",
      noteSw: "Hakiki kama EFD/VFD inahitajika na gharama zake kupitia TRA au chanzo rasmi.",
      noteEn: "Confirm whether EFD/VFD is required and the costs through TRA or official sources."
    });
  }

  if (plan.answers.expectsEmployees) {
    items.push({
      id: "employees",
      titleSw: "Wafanyakazi",
      titleEn: "Employees",
      noteSw: "Panga mikataba, payroll, michango na rekodi za ajira kabla ya kuajiri.",
      noteEn: "Plan contracts, payroll, contributions, and employment records before hiring."
    });
  }

  return items;
}

export function createBusinessComplianceReminders(plan: BusinessPlan): Reminder[] {
  const now = new Date().toISOString();
  const reminders: Reminder[] = [
    {
      id: `business-reminder-records-${plan.id}-${Date.now()}`,
      title: `Review records for ${plan.businessName}`,
      category: "business",
      date: addDays(30),
      repeat: "monthly",
      notes: "Check receipts, income, expenses, contracts, and business records.",
      notificationEnabled: true,
      linkedBusinessPlanId: plan.id,
      createdAt: now
    }
  ];

  if (plan.answers.needsTaxReminders) {
    reminders.push({
      id: `business-reminder-tax-${plan.id}-${Date.now()}`,
      title: `Confirm tax obligations for ${plan.businessName}`,
      category: "tax",
      date: addDays(14),
      repeat: "monthly",
      notes: "General reminder only. Confirm tax dates and requirements through TRA or a qualified professional.",
      notificationEnabled: true,
      linkedBusinessPlanId: plan.id,
      createdAt: now
    });
  }

  if (plan.answers.needsLicence || plan.answers.needsPhysicalLocation) {
    reminders.push({
      id: `business-reminder-licence-${plan.id}-${Date.now()}`,
      title: `Check licence requirements for ${plan.businessName}`,
      category: "licence",
      date: addDays(21),
      repeat: "yearly",
      notes: "Confirm licence type, renewal timing, inspections, and fees through the official authority.",
      notificationEnabled: true,
      linkedBusinessPlanId: plan.id,
      createdAt: now
    });
  }

  return reminders;
}
