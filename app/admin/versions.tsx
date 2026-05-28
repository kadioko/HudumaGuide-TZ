import { useEffect, useState } from "react";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { EmptyState } from "@/components/EmptyState";
import { InfoBanner } from "@/components/InfoBanner";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentChangeLog, loadContentChangeLogs } from "@/services/adminContentService";
import { formatDate } from "@/utils/copy";

export default function AdminVersionsScreen() {
  const [logs, setLogs] = useState<ContentChangeLog[]>([]);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    void loadContentChangeLogs().then(setLogs).catch((issue) => setError(issue instanceof Error ? issue.message : "Unable to load content versions."));
  }, []);

  return (
    <Screen>
      <SectionHeader title="Content versions" subtitle="Recent content change log for guide review and publishing." />
      {error ? <InfoBanner title="Version load issue" body={error} tone="warning" /> : null}
      {logs.length ? (
        logs.map((log) => (
          <AppCard key={log.id}>
            <AppText variant="h3">{log.action}</AppText>
            <AppText muted>{log.entityType}: {log.entityId}</AppText>
            <AppText variant="small" muted>{formatDate(log.createdAt)}</AppText>
          </AppCard>
        ))
      ) : (
        <EmptyState icon="git-branch-outline" title="No content versions yet" body="Admin updates will appear here once change logging is connected to production workflows." />
      )}
    </Screen>
  );
}
