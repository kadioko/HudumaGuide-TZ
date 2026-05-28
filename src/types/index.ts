export type Language = "sw" | "en";

export type SyncStatus = "local" | "syncing" | "synced" | "error";

export type SyncQueueItem = {
  id: string;
  reason: string;
  queuedAt: string;
  attempts: number;
  lastError?: string;
};

export type OfflineGuideCacheMeta = {
  cachedAt: string;
  guideCount: number;
  savedGuideSlugs: string[];
};

export type NotificationPreferences = {
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  defaultPreReminderDays: number[];
  permissionEducationSeen: boolean;
};

export type SecurityPreferences = {
  biometricLockEnabled: boolean;
  lastUnlockedAt?: string;
};

export type AnalyticsEventName =
  | "service_search"
  | "service_search_no_results"
  | "guide_saved"
  | "business_wizard_started"
  | "business_wizard_completed"
  | "business_wizard_dropoff"
  | "reminder_created"
  | "outdated_report_submitted"
  | "language_changed"
  | "region_city_updated"
  | "msaidizi_asked"
  | "support_request_submitted";

export type AnalyticsEvent = {
  id: string;
  name: AnalyticsEventName;
  count: number;
  payload: Record<string, string | number | boolean | string[] | undefined>;
  createdAt: string;
};

export type UserProfile = {
  id: string;
  email?: string;
  fullName?: string;
  preferredLanguage: Language;
  region?: string;
  city?: string;
  updatedAt?: string;
};

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
  expiresReviewAt?: string;
  verificationStatus?: "draft" | "needs_review" | "verified" | "outdated";
  reviewerNotes?: string;
  officialSourceRefs?: string[];
  published?: boolean;
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
  preReminderDays?: number[];
  scheduledNotificationIds?: string[];
  lastScheduledAt?: string;
  linkedServiceSlug?: string;
  linkedDocumentId?: string;
  linkedBusinessPlanId?: string;
  createdAt: string;
  updatedAt?: string;
};

export type DocumentFolder =
  | "Personal Documents"
  | "Business Documents"
  | "Tax Documents"
  | "Licences"
  | "Land/Property"
  | "Education"
  | "Family Documents"
  | "Other";

export type UserDocument = {
  id: string;
  title: string;
  documentType: string;
  folder: DocumentFolder;
  expiresOn?: string;
  reminderOn?: string;
  notes?: string;
  fileName?: string;
  mimeType?: string;
  linkedServiceSlug?: string;
  linkedBusinessPlanId?: string;
  createdAt: string;
  updatedAt: string;
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

export type BusinessCostEstimate = {
  id: string;
  label: string;
  amount?: string;
  notes?: string;
  officialFee: false;
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
  roadmapStepNotes?: Record<string, string>;
  roadmapStepCompletedAt?: Record<string, string>;
  costEstimates?: BusinessCostEstimate[];
  registrationStatus?: "planning" | "in_progress" | "registered" | "paused";
  tinStatus?: "unknown" | "needed" | "applied" | "active";
  licenceStatus?: "unknown" | "not_needed" | "needed" | "applied" | "active";
  createdAt: string;
  updatedAt?: string;
};

export type FeedbackReport = {
  id: string;
  serviceSlug?: string;
  category?: "outdated_info" | "support" | "privacy" | "bug" | "safety";
  message: string;
  createdAt: string;
};
