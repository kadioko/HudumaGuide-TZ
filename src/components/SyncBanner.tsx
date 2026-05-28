import { isSupabaseConfigured } from "@/lib/supabase";
import { useAppStore } from "@/store/useAppStore";
import { InfoBanner } from "./InfoBanner";

export function SyncBanner() {
  const userProfile = useAppStore((state) => state.userProfile);
  const syncStatus = useAppStore((state) => state.syncStatus);
  const syncError = useAppStore((state) => state.syncError);
  const syncQueue = useAppStore((state) => state.syncQueue);
  const offlineGuideCache = useAppStore((state) => state.offlineGuideCache);
  const lastRemoteSyncAt = useAppStore((state) => state.lastRemoteSyncAt);

  if (!isSupabaseConfigured) {
    return (
      <InfoBanner
        title="Local mode"
        body="Supabase keys are not configured. Your beta data is saved locally on this device."
      />
    );
  }

  if (!userProfile) {
    return (
      <InfoBanner
        title="Sign in to sync"
        body="Create an account to back up reminders, saved guides, document records, and business plans."
      />
    );
  }

  if (syncStatus === "error") {
    return (
      <InfoBanner
        title="Sync issue"
        body={`${syncError ?? "Your latest changes are saved locally and will need another sync."} Pending saves: ${syncQueue.length}.`}
        tone="warning"
      />
    );
  }

  return (
    <InfoBanner
      title={syncStatus === "syncing" ? "Syncing" : "Synced"}
      body={
        syncStatus === "syncing"
          ? "Saving your latest beta data to Supabase."
          : `Your account-backed data is up to date. Offline guide cache: ${offlineGuideCache?.guideCount ?? 0} guides. Last sync: ${
              lastRemoteSyncAt ? new Date(lastRemoteSyncAt).toLocaleString() : "not yet"
            }.`
      }
    />
  );
}
