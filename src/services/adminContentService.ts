import { serviceCategories } from "@/data/serviceCategories";
import { serviceGuides } from "@/data/serviceGuides";
import { supabase } from "@/lib/supabase";

export type ContentVerificationStatus = "draft" | "needs_review" | "verified" | "outdated";

export type AdminCategoryDraft = {
  id?: string;
  slug: string;
  titleEn: string;
  titleSw: string;
  icon?: string;
  published: boolean;
  verificationStatus: ContentVerificationStatus;
  reviewerNotes?: string;
};

export type AdminGuideDraft = {
  id?: string;
  slug: string;
  categoryId?: string;
  titleEn: string;
  titleSw: string;
  summaryEn: string;
  summarySw: string;
  officialUrl: string;
  published: boolean;
  verificationStatus: ContentVerificationStatus;
  lastVerifiedAt?: string;
  expiresReviewAt?: string;
  reviewerNotes?: string;
  sourceLastCheckedBy?: string;
  officialSourceRefs?: string[];
  msaidiziEnabled?: boolean;
  msaidiziExcludedReason?: string;
  requiredDocumentsJson?: string;
  stepsJson?: string;
  faqsJson?: string;
};

export type AdminFeedbackReport = {
  id: string;
  serviceSlug?: string;
  category?: "outdated_info" | "support" | "privacy" | "bug" | "safety";
  message: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  createdAt: string;
};

export type ContentChangeLog = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  beforeData?: Record<string, unknown>;
  afterData?: Record<string, unknown>;
  changedBy?: string;
  changedGuideSlug?: string;
  statusTransition?: string;
  createdAt: string;
};

export type MsaidiziAuditReview = {
  id: string;
  confidence: "grounded" | "fallback";
  matchedGuideSlugs: string[];
  fallbackUsed: boolean;
  questionLength: number;
  createdAt: string;
  reviewStatus?: "unreviewed" | "good" | "needs_fix" | "unsafe";
  reviewNotes?: string;
  reviewedAt?: string;
};

export type StorageCleanupItem = {
  id: string;
  userId: string;
  storagePath: string;
  status: "pending" | "deleted" | "failed";
  createdAt: string;
  processedAt?: string;
};

type FeedbackReportRow = {
  id: string;
  message: string;
  report_type?: AdminFeedbackReport["category"];
  status: AdminFeedbackReport["status"];
  created_at: string;
  service_guides?: { slug?: string } | { slug?: string }[] | null;
};

function requireAdminClient() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Admin changes will stay in planning mode.");
  }

  return supabase;
}

export function getLocalAdminCategories(): AdminCategoryDraft[] {
  return serviceCategories.map((category) => ({
    slug: category.id,
    titleEn: category.titleEn,
    titleSw: category.titleSw,
    icon: category.icon,
    published: true,
    verificationStatus: "needs_review"
  }));
}

export function getLocalAdminGuides(): AdminGuideDraft[] {
  return serviceGuides.map((guide) => ({
    slug: guide.slug,
    categoryId: guide.categoryId,
    titleEn: guide.titleEn,
    titleSw: guide.titleSw,
    summaryEn: guide.summaryEn,
    summarySw: guide.summarySw,
    officialUrl: guide.officialUrl,
    published: guide.published ?? true,
    verificationStatus: guide.verificationStatus ?? "needs_review",
    lastVerifiedAt: guide.lastVerifiedAt,
    expiresReviewAt: guide.expiresReviewAt,
    reviewerNotes: guide.reviewerNotes,
    sourceLastCheckedBy: guide.sourceLastCheckedBy,
    officialSourceRefs: guide.officialSourceRefs,
    msaidiziEnabled: true,
    requiredDocumentsJson: JSON.stringify(guide.requiredDocuments, null, 2),
    stepsJson: JSON.stringify(guide.steps, null, 2),
    faqsJson: JSON.stringify(guide.faqs, null, 2)
  }));
}

export async function loadAdminCategories() {
  if (!supabase) {
    return getLocalAdminCategories();
  }

  const { data, error } = await supabase
    .from("service_categories")
    .select("id, slug, title_en, title_sw, icon, published, verification_status, reviewer_notes")
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    titleEn: row.title_en,
    titleSw: row.title_sw,
    icon: row.icon ?? undefined,
    published: Boolean(row.published),
    verificationStatus: row.verification_status as ContentVerificationStatus,
    reviewerNotes: row.reviewer_notes ?? undefined
  }));
}

export async function loadAdminGuides() {
  if (!supabase) {
    return getLocalAdminGuides();
  }

  const { data, error } = await supabase
    .from("service_guides")
    .select("id, slug, category_id, title_en, title_sw, summary_en, summary_sw, official_url, published, verification_status, last_verified_at, expires_review_at, reviewer_notes, source_last_checked_by, official_source_refs, msaidizi_enabled, msaidizi_excluded_reason, required_documents, steps, faqs")
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    categoryId: row.category_id,
    titleEn: row.title_en,
    titleSw: row.title_sw,
    summaryEn: row.summary_en,
    summarySw: row.summary_sw,
    officialUrl: row.official_url,
    published: Boolean(row.published),
    verificationStatus: row.verification_status as ContentVerificationStatus,
    lastVerifiedAt: row.last_verified_at ?? undefined,
    expiresReviewAt: row.expires_review_at ?? undefined,
    reviewerNotes: row.reviewer_notes ?? undefined,
    sourceLastCheckedBy: row.source_last_checked_by ?? undefined,
    officialSourceRefs: Array.isArray(row.official_source_refs) ? row.official_source_refs : [],
    msaidiziEnabled: row.msaidizi_enabled ?? true,
    msaidiziExcludedReason: row.msaidizi_excluded_reason ?? undefined,
    requiredDocumentsJson: JSON.stringify(row.required_documents ?? [], null, 2),
    stepsJson: JSON.stringify(row.steps ?? [], null, 2),
    faqsJson: JSON.stringify(row.faqs ?? [], null, 2)
  }));
}

export async function loadAdminFeedbackReports() {
  if (!supabase) {
    return [] as AdminFeedbackReport[];
  }

  const { data, error } = await supabase
    .from("feedback_reports")
    .select("id, message, report_type, status, created_at, service_guides(slug)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  return ((data ?? []) as FeedbackReportRow[]).map((row) => ({
    id: row.id,
    serviceSlug: Array.isArray(row.service_guides) ? row.service_guides[0]?.slug : row.service_guides?.slug,
    category: row.report_type ?? "outdated_info",
    message: row.message,
    status: row.status,
    createdAt: row.created_at
  })) as AdminFeedbackReport[];
}

export async function upsertAdminCategory(category: AdminCategoryDraft) {
  const client = requireAdminClient();
  const { error } = await client.from("service_categories").upsert(
    {
      id: category.id,
      slug: category.slug,
      title_en: category.titleEn,
      title_sw: category.titleSw,
      icon: category.icon,
      published: category.published,
      verification_status: category.verificationStatus,
      reviewer_notes: category.reviewerNotes ?? null
    },
    { onConflict: category.id ? "id" : "slug" }
  );

  if (error) {
    throw error;
  }
}

export async function upsertAdminGuide(guide: AdminGuideDraft) {
  const client = requireAdminClient();
  const { error } = await client.from("service_guides").upsert(
    {
      id: guide.id,
      slug: guide.slug,
      category_id: guide.categoryId,
      title_en: guide.titleEn,
      title_sw: guide.titleSw,
      summary_en: guide.summaryEn,
      summary_sw: guide.summarySw,
      official_url: guide.officialUrl,
      published: guide.published && guide.verificationStatus === "verified",
      verification_status: guide.verificationStatus,
      last_verified_at: guide.lastVerifiedAt || null,
      expires_review_at: guide.expiresReviewAt || null,
      reviewer_notes: guide.reviewerNotes || null,
      source_last_checked_by: guide.sourceLastCheckedBy || null,
      official_source_refs: guide.officialSourceRefs ?? [],
      msaidizi_enabled: guide.msaidiziEnabled ?? true,
      msaidizi_excluded_reason: guide.msaidiziExcludedReason || null,
      required_documents: parseJsonArray(guide.requiredDocumentsJson),
      steps: parseJsonArray(guide.stepsJson),
      faqs: parseJsonArray(guide.faqsJson)
    },
    { onConflict: guide.id ? "id" : "slug" }
  );

  if (error) {
    throw error;
  }
}

function parseJsonArray(value?: string) {
  if (!value?.trim()) {
    return [];
  }

  const parsed = JSON.parse(value);
  if (!Array.isArray(parsed)) {
    throw new Error("Guide content JSON fields must be arrays.");
  }

  return parsed;
}

export async function updateFeedbackStatus(id: string, status: AdminFeedbackReport["status"], resolutionNotes?: string) {
  const client = requireAdminClient();
  const { error } = await client
    .from("feedback_reports")
    .update({
      status,
      resolution_notes: resolutionNotes ?? null,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function loadContentChangeLogs() {
  if (!supabase) {
    return [] as ContentChangeLog[];
  }

  const { data, error } = await supabase
    .from("content_change_logs")
    .select("id, entity_type, entity_id, action, before_data, after_data, changed_by, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    beforeData: (row.before_data ?? undefined) as Record<string, unknown> | undefined,
    afterData: (row.after_data ?? undefined) as Record<string, unknown> | undefined,
    changedBy: row.changed_by ?? undefined,
    changedGuideSlug: getChangedGuideSlug(row.before_data, row.after_data),
    statusTransition: getStatusTransition(row.before_data, row.after_data),
    createdAt: row.created_at
  }));
}

function getChangedGuideSlug(beforeData?: unknown, afterData?: unknown) {
  const beforeSlug = getRecordValue(beforeData, "slug");
  const afterSlug = getRecordValue(afterData, "slug");
  return afterSlug ?? beforeSlug;
}

function getStatusTransition(beforeData?: unknown, afterData?: unknown) {
  const beforeStatus = getRecordValue(beforeData, "verification_status") ?? getRecordValue(beforeData, "verificationStatus");
  const afterStatus = getRecordValue(afterData, "verification_status") ?? getRecordValue(afterData, "verificationStatus");
  if (!beforeStatus && !afterStatus) {
    return undefined;
  }

  return `${beforeStatus ?? "unset"} -> ${afterStatus ?? "unset"}`;
}

function getRecordValue(value: unknown, key: string) {
  if (!value || typeof value !== "object" || !(key in value)) {
    return undefined;
  }

  const recordValue = (value as Record<string, unknown>)[key];
  return typeof recordValue === "string" ? recordValue : undefined;
}

export async function loadMsaidiziAuditReviews() {
  if (!supabase) {
    return [] as MsaidiziAuditReview[];
  }

  const { data: logs, error } = await supabase
    .from("msaidizi_audit_logs")
    .select("id, confidence, matched_guide_slugs, fallback_used, question_length, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  const ids = (logs ?? []).map((row) => row.id);
  const { data: reviews } = ids.length
    ? await supabase
        .from("msaidizi_audit_reviews")
        .select("audit_log_id, status, reviewer_notes, reviewed_at")
        .in("audit_log_id", ids)
    : { data: [] };
  const reviewByAuditId = new Map((reviews ?? []).map((row) => [row.audit_log_id, row]));

  return (logs ?? []).map((row) => {
    const review = reviewByAuditId.get(row.id);
    return {
    id: row.id,
    confidence: row.confidence,
    matchedGuideSlugs: row.matched_guide_slugs ?? [],
    fallbackUsed: row.fallback_used,
    questionLength: row.question_length,
      createdAt: row.created_at,
      reviewStatus: review?.status ?? "unreviewed",
      reviewNotes: review?.reviewer_notes ?? undefined,
      reviewedAt: review?.reviewed_at ?? undefined
    };
  });
}

export async function reviewMsaidiziAudit(
  auditLogId: string,
  status: Exclude<NonNullable<MsaidiziAuditReview["reviewStatus"]>, "unreviewed">,
  reviewerNotes?: string
) {
  const client = requireAdminClient();
  const { error } = await client.from("msaidizi_audit_reviews").upsert(
    {
      audit_log_id: auditLogId,
      status,
      reviewer_notes: reviewerNotes || null,
      reviewed_at: new Date().toISOString()
    },
    { onConflict: "audit_log_id" }
  );

  if (error) {
    throw error;
  }
}

export async function loadStorageCleanupQueue() {
  if (!supabase) {
    return [] as StorageCleanupItem[];
  }

  const { data, error } = await supabase
    .from("account_deletion_file_cleanup")
    .select("id, user_id, storage_path, status, created_at, processed_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    storagePath: row.storage_path,
    status: row.status,
    createdAt: row.created_at,
    processedAt: row.processed_at ?? undefined
  })) as StorageCleanupItem[];
}

export async function updateStorageCleanupStatus(id: string, status: StorageCleanupItem["status"]) {
  const client = requireAdminClient();
  const { error } = await client
    .from("account_deletion_file_cleanup")
    .update({
      status,
      processed_at: status === "pending" ? null : new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}
