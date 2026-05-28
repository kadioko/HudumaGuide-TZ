import { Pill } from "@/components/Pill";
import { useAppStore } from "@/store/useAppStore";
import { getRecordSyncLabel, getRecordSyncState } from "@/utils/sync";

type RecordSyncPillProps = {
  createdAt?: string;
  updatedAt?: string;
};

export function RecordSyncPill({ createdAt, updatedAt }: RecordSyncPillProps) {
  const userProfile = useAppStore((state) => state.userProfile);
  const syncStatus = useAppStore((state) => state.syncStatus);
  const lastRemoteSyncAt = useAppStore((state) => state.lastRemoteSyncAt);
  const state = getRecordSyncState({
    createdAt,
    updatedAt,
    lastRemoteSyncAt,
    syncStatus,
    signedIn: Boolean(userProfile)
  });

  return <Pill label={getRecordSyncLabel(state)} active={state === "pending" || state === "syncing" || state === "error"} />;
}
