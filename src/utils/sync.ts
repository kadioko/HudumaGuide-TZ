import { SyncStatus } from "@/types";

export type RecordSyncState = "local" | "pending" | "syncing" | "synced" | "error";

type RecordSyncInput = {
  createdAt?: string;
  updatedAt?: string;
  lastRemoteSyncAt?: string;
  syncStatus: SyncStatus;
  signedIn: boolean;
};

export function getRecordSyncState({
  createdAt,
  updatedAt,
  lastRemoteSyncAt,
  syncStatus,
  signedIn
}: RecordSyncInput): RecordSyncState {
  if (!signedIn) {
    return "local";
  }

  if (syncStatus === "error") {
    return "error";
  }

  if (syncStatus === "syncing") {
    return "syncing";
  }

  const recordTime = new Date(updatedAt ?? createdAt ?? 0).getTime();
  const syncedTime = new Date(lastRemoteSyncAt ?? 0).getTime();
  if (!lastRemoteSyncAt || recordTime > syncedTime) {
    return "pending";
  }

  return "synced";
}

export function getRecordSyncLabel(state: RecordSyncState) {
  switch (state) {
    case "local":
      return "local";
    case "pending":
      return "pending sync";
    case "syncing":
      return "syncing";
    case "error":
      return "sync needed";
    case "synced":
      return "synced";
  }
}
