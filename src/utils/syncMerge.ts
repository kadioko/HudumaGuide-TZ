import { BusinessPlan, FeedbackReport, Reminder, SyncDomain, SyncQueueItem, UserDocument } from "@/types";

export type ChecklistState = Record<string, string[]>;

export type SyncMergePayload = {
  savedGuideSlugs: string[];
  checklistItemsByGuide: ChecklistState;
  reminders: Reminder[];
  userDocuments: UserDocument[];
  businessPlans: BusinessPlan[];
  feedbackReports: FeedbackReport[];
};

const allSyncDomains: SyncDomain[] = ["saved_guides", "checklists", "reminders", "documents", "business_plans"];

export function upsertSyncQueueItem(queue: SyncQueueItem[], error: string, now = new Date()) {
  const current = queue[0];
  if (current) {
    return [{ ...current, attempts: current.attempts + 1, lastError: error }, ...queue.slice(1)];
  }

  return [
    {
      id: `sync-${now.getTime()}`,
      reason: "Save latest local changes",
      queuedAt: now.toISOString(),
      attempts: 1,
      lastError: error,
      domains: allSyncDomains
    }
  ];
}

export function mergeRemoteWithLocal(remote: SyncMergePayload, local: SyncMergePayload) {
  return {
    savedGuideSlugs: Array.from(new Set([...local.savedGuideSlugs, ...remote.savedGuideSlugs])),
    checklistItemsByGuide: mergeChecklistState(local.checklistItemsByGuide, remote.checklistItemsByGuide),
    reminders: mergeByUpdatedAt(local.reminders, remote.reminders),
    userDocuments: mergeByUpdatedAt(local.userDocuments, remote.userDocuments),
    businessPlans: mergeByUpdatedAt(local.businessPlans, remote.businessPlans),
    feedbackReports: mergeByCreatedAt(local.feedbackReports, remote.feedbackReports)
  };
}

export function getSyncConflictReasons(remote: SyncMergePayload, local: SyncMergePayload) {
  return [
    ...getUpdatedAtConflictReasons("reminder", remote.reminders, local.reminders),
    ...getUpdatedAtConflictReasons("document", remote.userDocuments, local.userDocuments),
    ...getUpdatedAtConflictReasons("business plan", remote.businessPlans, local.businessPlans)
  ];
}

export function mergeChecklistState(local: ChecklistState, remote: ChecklistState) {
  const keys = Array.from(new Set([...Object.keys(local), ...Object.keys(remote)]));
  return keys.reduce<ChecklistState>((acc, key) => {
    acc[key] = Array.from(new Set([...(local[key] ?? []), ...(remote[key] ?? [])]));
    return acc;
  }, {});
}

function mergeByUpdatedAt<T extends { id: string; createdAt?: string; updatedAt?: string }>(localItems: T[], remoteItems: T[]) {
  const items = new Map<string, T>();
  for (const item of [...remoteItems, ...localItems]) {
    const current = items.get(item.id);
    if (!current) {
      items.set(item.id, item);
      continue;
    }

    const currentTime = new Date(current.updatedAt ?? current.createdAt ?? 0).getTime();
    const nextTime = new Date(item.updatedAt ?? item.createdAt ?? 0).getTime();
    if (nextTime >= currentTime) {
      items.set(item.id, item);
    }
  }

  return Array.from(items.values());
}

function mergeByCreatedAt<T extends { id: string; createdAt?: string }>(localItems: T[], remoteItems: T[]) {
  const items = new Map<string, T>();
  for (const item of [...remoteItems, ...localItems]) {
    items.set(item.id, item);
  }

  return Array.from(items.values()).sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

function getUpdatedAtConflictReasons<T extends { id: string; createdAt?: string; updatedAt?: string }>(
  label: string,
  remoteItems: T[],
  localItems: T[]
) {
  const localById = new Map(localItems.map((item) => [item.id, item]));
  return remoteItems.flatMap((remoteItem) => {
    const localItem = localById.get(remoteItem.id);
    if (!localItem) {
      return [];
    }

    const remoteUpdatedAt = remoteItem.updatedAt ?? remoteItem.createdAt ?? "";
    const localUpdatedAt = localItem.updatedAt ?? localItem.createdAt ?? "";
    if (remoteUpdatedAt && localUpdatedAt && remoteUpdatedAt !== localUpdatedAt) {
      return [`Remote ${label} ${remoteItem.id} differed from local copy; newest timestamp was kept.`];
    }

    return [];
  });
}
