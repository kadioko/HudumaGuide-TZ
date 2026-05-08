export type Language = "sw" | "en";

export type ServiceCategory = {
  id: string;
  titleSw: string;
  titleEn: string;
  icon: string;
};

export type ServiceRequiredDocument = {
  id: string;
  titleSw: string;
  titleEn: string;
  noteSw?: string;
  noteEn?: string;
};

export type ServiceStep = {
  id: string;
  titleSw: string;
  titleEn: string;
  descriptionSw: string;
  descriptionEn: string;
};

export type ServiceFaq = {
  questionSw: string;
  questionEn: string;
  answerSw: string;
  answerEn: string;
};

export type ServiceGuide = {
  id: string;
  slug: string;
  categoryId: string;
  titleSw: string;
  titleEn: string;
  summarySw: string;
  summaryEn: string;
  whoNeedsItSw: string;
  whoNeedsItEn: string;
  estimatedTime: string;
  estimatedCostNote: string;
  officialUrl: string;
  physicalLocationNote: string;
  complexity: "Easy" | "Medium" | "Detailed";
  keywords: string[];
  requiredDocuments: ServiceRequiredDocument[];
  steps: ServiceStep[];
  commonMistakesSw: string[];
  commonMistakesEn: string[];
  faqs: ServiceFaq[];
  lastVerifiedAt: string;
  disclaimer: string;
};

export type ReminderCategory =
  | "document"
  | "licence"
  | "tax"
  | "service"
  | "passport"
  | "driving"
  | "business"
  | "custom";

export type Reminder = {
  id: string;
  title: string;
  category: ReminderCategory;
  date: string;
  repeat: "none" | "weekly" | "monthly" | "yearly";
  notes?: string;
  notificationEnabled: boolean;
  linkedServiceSlug?: string;
  createdAt: string;
};

export type BusinessStructure =
  | "sole_trader"
  | "business_name"
  | "limited_company"
  | "partnership"
  | "ngo"
  | "freelancer";

export type BusinessWizardAnswers = {
  businessIdea: string;
  ownership: "alone" | "partners";
  preferredStructure: BusinessStructure;
  hasNida: boolean;
  hasTin: boolean;
  hasAddress: boolean;
  needsPhysicalLocation: boolean;
  industry: string;
  expectsEmployees: boolean;
  needsLicence: boolean;
  needsEfd: boolean;
  needsTaxReminders: boolean;
  city: string;
};

export type RoadmapStep = {
  id: string;
  titleSw: string;
  titleEn: string;
  descriptionSw: string;
  descriptionEn: string;
  linkedServiceSlug?: string;
};

export type BusinessPlan = {
  id: string;
  businessName: string;
  ownerName: string;
  structure: BusinessStructure;
  industry: string;
  city: string;
  answers: BusinessWizardAnswers;
  roadmap: RoadmapStep[];
  completedStepIds: string[];
  createdAt: string;
};

export type FeedbackReport = {
  id: string;
  serviceSlug?: string;
  message: string;
  createdAt: string;
};
