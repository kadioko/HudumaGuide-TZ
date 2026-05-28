import { useEffect, useState } from "react";
import { Alert, View, StyleSheet } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { EmptyState } from "@/components/EmptyState";
import { InfoBanner } from "@/components/InfoBanner";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import {
  loadStorageCleanupQueue,
  StorageCleanupItem,
  updateStorageCleanupStatus
} from "@/services/adminContentService";
import { formatDate } from "@/utils/copy";
import { spacing } from "@/constants/theme";

export default function AdminStorageCleanupScreen() {
  const [items, setItems] = useState<StorageCleanupItem[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    setError(undefined);
    try {
      setItems(await loadStorageCleanupQueue());
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Unable to load Storage cleanup queue.");
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(item: StorageCleanupItem, status: StorageCleanupItem["status"]) {
    try {
      await updateStorageCleanupStatus(item.id, status);
      await refresh();
    } catch (issue) {
      Alert.alert("Cleanup queue", issue instanceof Error ? issue.message : "Unable to update cleanup status.");
    }
  }

  return (
    <Screen>
      <SectionHeader title="Storage cleanup" subtitle="Track document files queued after account or record deletion." />
      <InfoBanner
        title="Service-role action required"
        body="This screen tracks cleanup state. Actual private Storage deletion should run from a trusted service-role script or Supabase function, not from the mobile client."
        tone="warning"
      />
      {error ? <InfoBanner title="Cleanup queue issue" body={error} tone="warning" /> : null}
      <AppButton title={loading ? "Refreshing" : "Refresh queue"} icon="refresh-outline" variant="secondary" onPress={refresh} />

      {items.length ? (
        items.map((item) => (
          <AppCard key={item.id}>
            <View style={styles.row}>
              <Pill label={item.status} active={item.status !== "deleted"} />
              <Pill label={formatDate(item.createdAt)} />
            </View>
            <AppText variant="h3">Queued file</AppText>
            <AppText muted>{item.storagePath}</AppText>
            <AppText variant="small" muted>User: {item.userId}</AppText>
            {item.processedAt ? <AppText variant="small" muted>Processed: {formatDate(item.processedAt)}</AppText> : null}
            <View style={styles.actions}>
              <AppButton title="Mark deleted" icon="checkmark-circle-outline" variant="secondary" onPress={() => setStatus(item, "deleted")} style={styles.action} />
              <AppButton title="Mark failed" icon="alert-circle-outline" variant="ghost" onPress={() => setStatus(item, "failed")} style={styles.action} />
            </View>
          </AppCard>
        ))
      ) : (
        <EmptyState icon="shield-checkmark-outline" title="No cleanup items" body="Deleted document file paths will appear here after migration 007 is live and records are removed." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  action: {
    flex: 1
  }
});
