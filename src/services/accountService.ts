import { serviceGuides } from "@/data/serviceGuides";
import { supabase } from "@/lib/supabase";
import { BusinessPlan, FeedbackReport, Language, Reminder, UserDocument, UserProfile } from "@/types";

type ChecklistState = Record<string, string[]>;

export type RemoteUserData = {
  profile: UserProfile;
  savedGuideSlugs: string[];
  checklistItemsByGuide: ChecklistState;
  reminders: Reminder[];
  userDocuments: UserDocument[];
  businessPlans: BusinessPlan[];
  feedbackReports: FeedbackReport[];
};

export type LocalUserData = Omit<RemoteUserData, "profile"> & {
  language: Language;
};

type ServiceGuideRow = {
  id: string;
  slug: string;
};

const guideSlugByLocalId = new Map(serviceGuides.map((guide) => [guide.id, guide.slug]));

function requireClient() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

function getGuideTitle(slug: string, itemId: string) {
  const guide = serviceGuides.find((item) => item.slug === slug);
  if (!guide) {
    return itemId;
  }

  if (itemId.startsWith("doc-")) {
    const documentId = itemId.replace("doc-", "");
    return guide.requiredDocuments.find((item) => item.id === documentId)?.titleEn ?? itemId;
  }

  if (itemId.startsWith("step-")) {
    const stepId = itemId.replace("step-", "");
    return guide.steps.find((item) => item.id === stepId)?.titleEn ?? itemId;
  }

  return itemId;
}

async function getGuideMaps() {
  const client = requireClient();
  const { data, error } = await client.from("service_guides").select("id, slug");

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as ServiceGuideRow[];
  const idBySlug = new Map(rows.map((guide) => [guide.slug, guide.id]));
  const slugById = new Map(rows.map((guide) => [guide.id, guide.slug]));

  return { idBySlug, slugById };
}

export async function getCurrentSession() {
  const client = requireClient();
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function signInWithPassword(email: string, password: string) {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }

  return data.session;
}

export async function signUpWithPassword(email: string, password: string, fullName?: string) {
  const client = requireClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    throw error;
  }

  return data.session;
}

export async function signOut() {
  const client = requireClient();
  const { error } = await client.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function ensureProfile(userId: string, email?: string, language: Language = "sw") {
  const client = requireClient();
  const { data: existing, error: readError } = await client.from("profiles").select("*").eq("id", userId).maybeSingle();

  if (readError) {
    throw readError;
  }

  if (!existing) {
    const { data, error } = await client
      .from("profiles")
      .insert({
        id: userId,
        preferred_language: language
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return mapProfile(data, email);
  }

  return mapProfile(existing, email);
}

export async function updateProfile(profile: UserProfile) {
  const client = requireClient();
  const { data, error } = await client
    .from("profiles")
    .update({
      full_name: profile.fullName || null,
      preferred_language: profile.preferredLanguage,
      region: profile.region || null,
      city: profile.city || null
    })
    .eq("id", profile.id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(data, profile.email);
}

export async function loadRemoteUserData(userId: string, email?: string, fallbackLanguage: Language = "sw"): Promise<RemoteUserData> {
  const client = requireClient();
  const profile = await ensureProfile(userId, email, fallbackLanguage);
  const { slugById } = await getGuideMaps();

  const [savedGuidesResult, checklistResult, remindersResult, documentsResult, roadmapsResult, feedbackResult] = await Promise.all([
    client.from("user_saved_guides").select("guide_id").eq("user_id", userId),
    client.from("user_checklist_items").select("guide_id, item_key, completed").eq("user_id", userId).eq("completed", true),
    client.from("user_reminders").select("*").eq("user_id", userId).order("remind_at", { ascending: true }),
    client.from("user_documents").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    client.from("business_roadmaps").select("generated_from_answers").eq("user_id", userId).order("created_at", { ascending: false }),
    client.from("feedback_reports").select("client_id, guide_id, report_type, message, created_at").eq("user_id", userId).order("created_at", { ascending: false })
  ]);

  for (const result of [savedGuidesResult, checklistResult, remindersResult, documentsResult, roadmapsResult, feedbackResult]) {
    if (result.error) {
      throw result.error;
    }
  }

  const savedGuideSlugs = (savedGuidesResult.data ?? [])
    .map((row) => slugById.get(row.guide_id))
    .filter((slug): slug is string => Boolean(slug));

  const checklistItemsByGuide = (checklistResult.data ?? []).reduce<ChecklistState>((acc, row) => {
    const slug = slugById.get(row.guide_id);
    if (!slug) {
      return acc;
    }

    acc[slug] = [...(acc[slug] ?? []), row.item_key];
    return acc;
  }, {});

  return {
    profile,
    savedGuideSlugs,
    checklistItemsByGuide,
    reminders: (remindersResult.data ?? []).map(mapReminder),
    userDocuments: (documentsResult.data ?? []).map(mapDocument),
    businessPlans: (roadmapsResult.data ?? [])
      .map((row) => row.generated_from_answers?.local_plan as BusinessPlan | undefined)
      .filter((plan): plan is BusinessPlan => Boolean(plan)),
    feedbackReports: (feedbackResult.data ?? []).map((row) => ({
      id: row.client_id ?? `feedback-${row.created_at}`,
      serviceSlug: row.guide_id ? slugById.get(row.guide_id) : undefined,
      category: row.report_type as FeedbackReport["category"],
      message: row.message,
      createdAt: row.created_at
    }))
  };
}

export async function saveRemoteUserData(userId: string, data: LocalUserData) {
  const client = requireClient();
  const { idBySlug } = await getGuideMaps();

  await updateSavedGuides(userId, data.savedGuideSlugs, idBySlug);
  await updateChecklistItems(userId, data.checklistItemsByGuide, idBySlug);

  const reminderRows = data.reminders.map((reminder) => ({
    user_id: userId,
    client_id: reminder.id,
    title: reminder.title,
    category: reminder.category,
    remind_at: reminder.date,
    repeat_option: reminder.repeat,
    notes: reminder.notes ?? null,
    notification_enabled: reminder.notificationEnabled,
    pre_reminder_days: reminder.preReminderDays ?? [],
    scheduled_notification_ids: reminder.scheduledNotificationIds ?? [],
    last_scheduled_at: reminder.lastScheduledAt ?? null,
    client_updated_at: reminder.updatedAt ?? reminder.createdAt,
    created_at: reminder.createdAt
  }));

  const documentRows = data.userDocuments.map((document) => ({
    user_id: userId,
    client_id: document.id,
    title: document.title,
    document_type: document.documentType,
    folder: document.folder,
    expires_on: document.expiresOn ?? null,
    reminder_on: document.reminderOn ?? null,
    storage_path: document.fileName ?? null,
    mime_type: document.mimeType ?? null,
    notes: document.notes ?? null,
    created_at: document.createdAt,
    updated_at: document.updatedAt
  }));

  const businessProfileRows = data.businessPlans.map((plan) => ({
    user_id: userId,
    client_id: plan.id,
    business_name: plan.businessName,
    owner_name: plan.ownerName,
    business_type: plan.structure,
    industry: plan.industry,
    city: plan.city,
    registration_status: plan.registrationStatus ?? "planning",
    tin_status: plan.tinStatus ?? (plan.answers.hasTin ? "active" : "needed"),
    licence_status: plan.licenceStatus ?? (plan.answers.needsLicence ? "needed" : "not_needed"),
    cost_estimates: plan.costEstimates ?? []
  }));

  const feedbackRows = data.feedbackReports.map((report) => ({
    user_id: userId,
    client_id: report.id,
    guide_id: report.serviceSlug ? idBySlug.get(report.serviceSlug) ?? null : null,
    report_type: report.category ?? "outdated_info",
    message: report.message,
    created_at: report.createdAt
  }));

  const results = await Promise.all([
    reminderRows.length
      ? client.from("user_reminders").upsert(reminderRows, { onConflict: "user_id,client_id" })
      : Promise.resolve({ error: null }),
    documentRows.length
      ? client.from("user_documents").upsert(documentRows, { onConflict: "user_id,client_id" })
      : Promise.resolve({ error: null }),
    businessProfileRows.length
      ? client.from("business_profiles").upsert(businessProfileRows, { onConflict: "user_id,client_id" })
      : Promise.resolve({ error: null }),
    feedbackRows.length
      ? client.from("feedback_reports").upsert(feedbackRows, { onConflict: "user_id,client_id" })
      : Promise.resolve({ error: null })
  ]);

  for (const result of results) {
    if (result.error) {
      throw result.error;
    }
  }

  if (data.businessPlans.length) {
    const { data: profileRows, error } = await client
      .from("business_profiles")
      .select("id, client_id")
      .eq("user_id", userId)
      .in("client_id", data.businessPlans.map((plan) => plan.id));

    if (error) {
      throw error;
    }

    const profileIdByClientId = new Map((profileRows ?? []).map((row) => [row.client_id, row.id]));
    const roadmapRows = data.businessPlans
      .map((plan) => {
        const profileId = profileIdByClientId.get(plan.id);
        if (!profileId) {
          return null;
        }

        return {
          user_id: userId,
          client_id: plan.id,
          business_profile_id: profileId,
          recommended_structure: plan.structure,
          generated_from_answers: {
            answers: plan.answers,
            local_plan: plan
          }
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    if (roadmapRows.length) {
      const { error: roadmapError } = await client
        .from("business_roadmaps")
        .upsert(roadmapRows, { onConflict: "user_id,client_id" });

      if (roadmapError) {
        throw roadmapError;
      }
    }
  }
}

export async function exportRemoteUserData(userId: string, localData: LocalUserData) {
  const remote = await loadRemoteUserData(userId, undefined, localData.language);
  return {
    exportedAt: new Date().toISOString(),
    source: "HudumaGuide TZ",
    localData,
    remoteData: remote
  };
}

export async function deleteAccountAndData() {
  const client = requireClient();
  const { error } = await client.rpc("delete_current_user");

  if (error) {
    throw error;
  }
}

function mapProfile(row: Record<string, string | null>, email?: string): UserProfile {
  return {
    id: row.id ?? "",
    email,
    fullName: row.full_name ?? undefined,
    preferredLanguage: row.preferred_language === "en" ? "en" : "sw",
    region: row.region ?? undefined,
    city: row.city ?? undefined,
    updatedAt: row.updated_at ?? undefined
  };
}

function mapReminder(row: Record<string, string | boolean | number[] | string[] | null>): Reminder {
  return {
    id: String(row.client_id || row.id),
    title: String(row.title),
    category: row.category as Reminder["category"],
    date: String(row.remind_at).slice(0, 10),
    repeat: row.repeat_option as Reminder["repeat"],
    notes: row.notes ? String(row.notes) : undefined,
    notificationEnabled: Boolean(row.notification_enabled),
    preReminderDays: Array.isArray(row.pre_reminder_days) ? row.pre_reminder_days as number[] : undefined,
    scheduledNotificationIds: Array.isArray(row.scheduled_notification_ids) ? row.scheduled_notification_ids as string[] : undefined,
    lastScheduledAt: row.last_scheduled_at ? String(row.last_scheduled_at) : undefined,
    createdAt: String(row.created_at),
    updatedAt: row.client_updated_at ? String(row.client_updated_at) : undefined
  };
}

function mapDocument(row: Record<string, string | null>): UserDocument {
  return {
    id: row.client_id || row.id || `document-${Date.now()}`,
    title: row.title ?? "",
    documentType: row.document_type ?? "Other",
    folder: (row.folder as UserDocument["folder"]) ?? "Other",
    expiresOn: row.expires_on ?? undefined,
    reminderOn: row.reminder_on ?? undefined,
    notes: row.notes ?? undefined,
    fileName: row.storage_path ?? undefined,
    mimeType: row.mime_type ?? undefined,
    linkedServiceSlug: row.linked_guide_id ? guideSlugByLocalId.get(row.linked_guide_id) : undefined,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString()
  };
}

async function updateSavedGuides(userId: string, savedGuideSlugs: string[], idBySlug: Map<string, string>) {
  const client = requireClient();
  const { error: deleteError } = await client.from("user_saved_guides").delete().eq("user_id", userId);

  if (deleteError) {
    throw deleteError;
  }

  const rows = savedGuideSlugs
    .map((slug) => idBySlug.get(slug))
    .filter((guideId): guideId is string => Boolean(guideId))
    .map((guideId) => ({ user_id: userId, guide_id: guideId }));

  if (!rows.length) {
    return;
  }

  const { error } = await client.from("user_saved_guides").insert(rows);
  if (error) {
    throw error;
  }
}

async function updateChecklistItems(userId: string, checklistItemsByGuide: ChecklistState, idBySlug: Map<string, string>) {
  const client = requireClient();
  const { error: deleteError } = await client.from("user_checklist_items").delete().eq("user_id", userId);

  if (deleteError) {
    throw deleteError;
  }

  const rows = Object.entries(checklistItemsByGuide).flatMap(([slug, itemIds]) => {
    const guideId = idBySlug.get(slug);
    if (!guideId) {
      return [];
    }

    return itemIds.map((itemId) => ({
      user_id: userId,
      guide_id: guideId,
      item_type: itemId.startsWith("doc-") ? "document" : itemId.startsWith("step-") ? "step" : "custom",
      item_key: itemId,
      title: getGuideTitle(slug, itemId),
      completed: true,
      completed_at: new Date().toISOString()
    }));
  });

  if (!rows.length) {
    return;
  }

  const { error } = await client.from("user_checklist_items").insert(rows);
  if (error) {
    throw error;
  }
}
