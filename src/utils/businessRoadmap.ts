import { BusinessPlan, BusinessWizardAnswers, RoadmapStep } from "@/types";

function step(
  id: string,
  titleSw: string,
  titleEn: string,
  descriptionSw: string,
  descriptionEn: string,
  linkedServiceSlug?: string
): RoadmapStep {
  return { id, titleSw, titleEn, descriptionSw, descriptionEn, linkedServiceSlug };
}

export function generateBusinessRoadmap(answers: BusinessWizardAnswers): RoadmapStep[] {
  const steps: RoadmapStep[] = [];

  if (!answers.hasNida) {
    steps.push(
      step(
        "prepare-nida",
        "Andaa NIDA/NIN",
        "Prepare NIDA/NIN",
        "NIDA/NIN mara nyingi huhitajika kwenye usajili, TIN na leseni.",
        "NIDA/NIN is commonly needed for registration, TIN, and licences.",
        "nida-nin-application"
      )
    );
  }

  steps.push(
    step(
      "choose-structure",
      "Chagua muundo wa biashara",
      "Choose business structure",
      "Linganisha biashara binafsi, jina la biashara, partnership au limited company kabla ya kuanza.",
      "Compare sole trader, business name, partnership, or limited company before starting."
    )
  );

  if (answers.preferredStructure === "limited_company") {
    steps.push(
      step(
        "register-company",
        "Sajili limited company",
        "Register limited company",
        "Andaa taarifa za wakurugenzi, wanahisa na anuani ya kampuni.",
        "Prepare director, shareholder, and company address details.",
        "limited-company-registration"
      )
    );
  } else if (answers.preferredStructure === "business_name" || answers.preferredStructure === "sole_trader" || answers.preferredStructure === "freelancer") {
    steps.push(
      step(
        "register-business-name",
        "Fanya name search na usajili",
        "Do name search and registration",
        "Andaa majina mbadala na hakiki jina kupitia chanzo rasmi.",
        "Prepare alternative names and confirm availability through official channels.",
        "business-name-registration"
      )
    );
  } else {
    steps.push(
      step(
        "prepare-entity-docs",
        "Andaa nyaraka za muundo uliouchagua",
        "Prepare structure documents",
        "Muundo huu unaweza kuhitaji makubaliano, katiba au nyaraka zaidi. Hakiki rasmi.",
        "This structure may need agreements, a constitution, or extra documents. Confirm officially."
      )
    );
  }

  if (!answers.hasTin) {
    steps.push(
      step(
        "get-tin",
        "Pata au hakiki TIN",
        "Get or confirm TIN",
        "TIN inaweza kuhitajika kwa kodi, leseni na kumbukumbu za biashara.",
        "TIN may be needed for tax, licences, and business records.",
        "tin-registration"
      )
    );
  }

  if (!answers.hasAddress) {
    steps.push(
      step(
        "business-address",
        "Panga anuani ya biashara",
        "Set business address",
        "Andaa anuani ya biashara na mawasiliano yanayotumika rasmi.",
        "Prepare a business address and official contact details."
      )
    );
  }

  if (answers.needsLicence || answers.needsPhysicalLocation || answers.industry.toLowerCase().includes("food")) {
    steps.push(
      step(
        "business-licence",
        "Hakiki na omba leseni",
        "Confirm and apply for licence",
        "Aina ya leseni hutegemea shughuli, eneo na regulator. Hakiki kabla ya malipo.",
        "Licence type depends on activity, location, and regulator. Confirm before payment.",
        "business-licence-application"
      )
    );
  }

  if (answers.needsEfd) {
    steps.push(
      step(
        "efd-vfd",
        "Panga EFD/VFD kama inahitajika",
        "Plan EFD/VFD if required",
        "Hakiki kama biashara yako inahitaji EFD/VFD na namna ya kutunza risiti.",
        "Confirm whether your business needs EFD/VFD and how to keep receipts."
      )
    );
  }

  if (answers.expectsEmployees) {
    steps.push(
      step(
        "employee-records",
        "Andaa rekodi za wafanyakazi",
        "Prepare employee records",
        "Kama utaajiri, hakiki mahitaji ya ajira, mikataba na michango husika.",
        "If hiring, confirm employment, contract, and contribution requirements."
      )
    );
  }

  steps.push(
    step(
      "records",
      "Tenganisha rekodi za biashara",
      "Separate business records",
      "Tumia akaunti, mobile money au daftari tofauti kwa mapato, matumizi na risiti.",
      "Use a separate account, mobile money, or ledger for income, expenses, and receipts."
    )
  );

  if (answers.needsTaxReminders) {
    steps.push(
      step(
        "tax-reminders",
        "Weka reminders za kodi na renewal",
        "Set tax and renewal reminders",
        "Weka reminders kabla ya deadline ili kuepuka kusahau compliance.",
        "Set reminders before deadlines to avoid missing compliance dates.",
        "tax-deadline-reminders"
      )
    );
  }

  return steps;
}

export function createBusinessPlan(
  answers: BusinessWizardAnswers,
  businessName: string,
  ownerName: string
): BusinessPlan {
  return {
    id: `plan-${Date.now()}`,
    businessName,
    ownerName,
    structure: answers.preferredStructure,
    industry: answers.industry,
    city: answers.city,
    answers,
    roadmap: generateBusinessRoadmap(answers),
    completedStepIds: [],
    roadmapStepNotes: {},
    roadmapStepCompletedAt: {},
    costEstimates: [],
    registrationStatus: "planning",
    tinStatus: answers.hasTin ? "active" : "needed",
    licenceStatus: answers.needsLicence ? "needed" : "not_needed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
