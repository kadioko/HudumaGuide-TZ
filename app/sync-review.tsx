import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { EmptyState } from "@/components/EmptyState";
import { InfoBanner } from "@/components/InfoBanner";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { spacing } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/utils/copy";

export default function SyncReviewScreen() {
  const syncStatus = useAppStore((state) => state.syncStatus);
  const syncError = useAppStore((state) => state.syncError);
  const syncQueue = useAppStore((state) => state.syncQueue);
  const lastRemoteSyncAt = useAppStore((state) => state.lastRemoteSyncAt);
  const retryQueuedSync = useAppStore((state) => state.retryQueuedSync);
  const resolveSyncQueueItem = useAppStore((state) => state.resolveSyncQueueItem);

  return (
    <Screen>
      <SectionHeader title="Sync review" subtitle="Pending offline saves, retry state, and remote conflict markers." />
      <InfoBanner
        title={`Sync status: ${syncStatus}`}
        body={lastRemoteSyncAt ? `Last synced ${formatDate(lastRemoteSyncAt)}.` : "This device has not completed a remote sync yet."}
        tone={syncStatus === "error" ? "warning" : "info"}
      />
      {syncError ? <InfoBanner title="Latest sync issue" body={syncError} tone="warning" /> : null}

      <View style={styles.actions}>
        <AppButton title="Retry sync" icon="refresh-outline" onPress={retryQueuedSync} />
        <AppButton title="Back to profile" icon="person-outline" variant="secondary" onPress={() => router.push("/profile" as never)} />
      </View>

      {syncQueue.length ? (
        <View style={styles.stack}>
          {syncQueue.map((item) => (
            <AppCard key={item.id}>
              <View style={styles.row}>
                <AppText variant="h3">Pending sync item</AppText>
                <Pill label={`${item.attempts} retries`} />
              </View>
              <AppText muted>{item.reason}</AppText>
              <View style={styles.domainGrid}>
                {(item.domains ?? ["saved_guides", "checklists", "reminders", "documents", "business_plans"]).map((domain) => (
                  <View key={domain} style={styles.domainRow}>
                    <AppText variant="small" style={styles.domainLabel}>
                      {formatDomain(domain)}
                    </AppText>
                    <Pill label={domain === "documents" ? "metadata only" : "local latest"} />
                  </View>
                ))}
              </View>
              <AppText variant="tiny" muted>
                Queued {formatDate(item.queuedAt)}
              </AppText>
              {item.lastError ? (
                <AppText variant="small" muted>
                  Last error: {item.lastError}
                </AppText>
              ) : null}
              <View style={styles.actions}>
                <AppButton title="Keep local fields" icon="phone-portrait-outline" variant="secondary" onPress={() => resolveSyncQueueItem(item.id)} />
                <AppButton title="Retry remote save" icon="cloud-upload-outline" onPress={retryQueuedSync} />
              </View>
            </AppCard>
          ))}
        </View>
      ) : (
        <EmptyState
          icon="cloud-done-outline"
          title="No pending sync conflicts"
          body="Offline saves and remote conflict markers will appear here when they need review."
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm
  },
  stack: {
    gap: spacing.md
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  domainGrid: {
    gap: spacing.sm
  },
  domainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  domainLabel: {
    fontWeight: "800"
  }
});

function formatDomain(domain: string) {
  return domain.replace(/_/g, " ");
}
