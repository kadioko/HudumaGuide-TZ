import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { EmptyState } from "@/components/EmptyState";
import { InfoBanner } from "@/components/InfoBanner";
import { MetricTile } from "@/components/MetricTile";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { spacing } from "@/constants/theme";
import { ContentChangeLog, loadContentChangeLogs } from "@/services/adminContentService";
import { formatDate } from "@/utils/copy";

export default function AdminVersionsScreen() {
  const [logs, setLogs] = useState<ContentChangeLog[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [entityFilter, setEntityFilter] = useState("all");

  useEffect(() => {
    void loadContentChangeLogs().then(setLogs).catch((issue) => setError(issue instanceof Error ? issue.message : "Unable to load content versions."));
  }, []);

  const guideLogCount = logs.filter((log) => log.entityType === "service_guide").length;
  const latestLog = logs[0];
  const visibleLogs = logs.filter((log) => entityFilter === "all" || log.entityType === entityFilter);
  const entityTypes = Array.from(new Set(logs.map((log) => log.entityType)));

  return (
    <Screen>
      <SectionHeader title="Content versions" subtitle="What changed history from content_change_logs." />
      {error ? <InfoBanner title="Version load issue" body={error} tone="warning" /> : null}
      <View style={styles.metrics}>
        <MetricTile label="Total changes" value={String(logs.length)} icon="git-branch-outline" />
        <MetricTile label="Guide changes" value={String(guideLogCount)} icon="document-text-outline" tone="blue" />
        <MetricTile label="Latest" value={latestLog ? formatDate(latestLog.createdAt) : "None"} icon="time-outline" tone="gold" />
      </View>
      <View style={styles.filters}>
        <Pill label="all" active={entityFilter === "all"} onPress={() => setEntityFilter("all")} />
        {entityTypes.map((entityType) => (
          <Pill key={entityType} label={entityType} active={entityFilter === entityType} onPress={() => setEntityFilter(entityType)} />
        ))}
      </View>
      {visibleLogs.length ? (
        visibleLogs.map((log) => (
          <AppCard key={log.id}>
            <AppText variant="h3">{log.action}</AppText>
            <AppText muted>{log.entityType}: {log.entityId}</AppText>
            {log.changedGuideSlug ? <Pill label={`guide ${log.changedGuideSlug}`} /> : null}
            {log.statusTransition ? <Pill label={log.statusTransition} active /> : null}
            {log.changedBy ? <AppText muted>Changed by: {log.changedBy}</AppText> : null}
            <AppText muted>What changed: {summarizeDiff(log.beforeData, log.afterData)}</AppText>
            {log.beforeData || log.afterData ? (
              <View style={styles.diffGrid}>
                <AppText variant="small" style={styles.diffTitle}>Before</AppText>
                <AppText variant="small" style={styles.diffTitle}>After</AppText>
                <AppText variant="tiny" muted>{formatDiffData(log.beforeData)}</AppText>
                <AppText variant="tiny" muted>{formatDiffData(log.afterData)}</AppText>
              </View>
            ) : null}
            <AppText variant="small" muted>{formatDate(log.createdAt)}</AppText>
          </AppCard>
        ))
      ) : (
        <EmptyState icon="git-branch-outline" title="No content versions yet" body="Admin updates will appear here once change logging is connected to production workflows." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: "row",
    gap: spacing.sm
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  diffGrid: {
    gap: spacing.xs
  },
  diffTitle: {
    fontWeight: "800"
  }
});

function summarizeDiff(beforeData?: Record<string, unknown>, afterData?: Record<string, unknown>) {
  const keys = Array.from(new Set([...Object.keys(beforeData ?? {}), ...Object.keys(afterData ?? {})]));
  const changed = keys.filter((key) => JSON.stringify(beforeData?.[key]) !== JSON.stringify(afterData?.[key]));
  return changed.length ? changed.slice(0, 6).join(", ") : "No before/after fields were recorded.";
}

function formatDiffData(value?: Record<string, unknown>) {
  if (!value) {
    return "not recorded";
  }

  return JSON.stringify(value, null, 2).slice(0, 700);
}
