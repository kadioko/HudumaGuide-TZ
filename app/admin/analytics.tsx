import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { spacing } from "@/constants/theme";
import { getLocalAnalyticsSummary, getRemoteAnalyticsSummary } from "@/services/analyticsService";
import { loadMsaidiziAuditReviews, MsaidiziAuditReview, reviewMsaidiziAudit } from "@/services/adminContentService";

type AnalyticsSummary = Awaited<ReturnType<typeof getLocalAnalyticsSummary>>;
type AuditStatusFilter = "all" | "unreviewed" | "good" | "needs_fix" | "unsafe";
type AuditConfidenceFilter = "all" | "grounded" | "fallback";

export default function AdminAnalyticsScreen() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [remoteSummary, setRemoteSummary] = useState<AnalyticsSummary | undefined>();
  const [audits, setAudits] = useState<MsaidiziAuditReview[]>([]);
  const [auditStatusFilter, setAuditStatusFilter] = useState<AuditStatusFilter>("all");
  const [auditConfidenceFilter, setAuditConfidenceFilter] = useState<AuditConfidenceFilter>("all");
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setError(undefined);
    try {
      const [local, remote, auditRows] = await Promise.all([
        getLocalAnalyticsSummary(),
        getRemoteAnalyticsSummary().catch((issue) => {
          setError(issue instanceof Error ? issue.message : "Unable to load remote analytics.");
          return undefined;
        }),
        loadMsaidiziAuditReviews().catch(() => [])
      ]);
      setSummary(local);
      setRemoteSummary(remote);
      setAudits(auditRows);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Unable to load analytics.");
    }
  }

  async function markAudit(audit: MsaidiziAuditReview, status: "good" | "needs_fix" | "unsafe") {
    try {
      await reviewMsaidiziAudit(audit.id, status);
      await refresh();
    } catch (issue) {
      Alert.alert("Msaidizi review", issue instanceof Error ? issue.message : "Unable to save review.");
    }
  }

  const activeSummary = remoteSummary ?? summary;
  const filteredAudits = audits.filter((audit) => {
    const statusMatches = auditStatusFilter === "all" || audit.reviewStatus === auditStatusFilter;
    const confidenceMatches = auditConfidenceFilter === "all" || audit.confidence === auditConfidenceFilter;
    return statusMatches && confidenceMatches;
  });

  return (
    <Screen>
      <SectionHeader title="Internal analytics" subtitle="Privacy-safe beta learning without document contents or raw questions." />
      <InfoBanner
        title="Privacy guardrails"
        body="This dashboard avoids document contents, private notes, and raw Msaidizi questions. Use aggregated event counts and guide/category slugs only."
        tone="warning"
      />
      {error ? <InfoBanner title="Remote analytics issue" body={`${error} Showing local summary where available.`} tone="warning" /> : null}
      <AppButton title="Refresh analytics" icon="refresh-outline" variant="secondary" onPress={refresh} />

      <AppCard>
        <View style={styles.row}>
          <Pill label={remoteSummary ? "remote aggregate" : "local cache"} active />
          {summary ? <Pill label="local available" /> : null}
        </View>
        <AppText variant="h3">Event counts</AppText>
        {Object.entries(activeSummary?.counts ?? {}).map(([name, count]) => (
          <AppText key={name} muted>
            {name}: {count}
          </AppText>
        ))}
        {!activeSummary ? <AppText muted>Loading analytics...</AppText> : null}
      </AppCard>

      <MetricList title="Top searches" items={activeSummary?.topSearches ?? []} />
      <MetricList title="No-result searches" items={activeSummary?.noResultSearches ?? []} />
      <MetricList title="Most saved guides" items={activeSummary?.savedGuides ?? []} />
      <MetricList title="Reminder categories" items={activeSummary?.reminderCategories ?? []} />
      <MetricList title="Reported outdated guides" items={activeSummary?.reportedGuides ?? []} />

      <AppCard>
        <AppText variant="h3">Msaidizi quality review</AppText>
        <AppText muted>Audit rows exclude raw user questions. Mark answer quality using fallback rate, guide slugs, and question length only.</AppText>
        <View style={styles.row}>
          {(["all", "unreviewed", "good", "needs_fix", "unsafe"] as AuditStatusFilter[]).map((status) => (
            <Pill key={status} label={status} active={auditStatusFilter === status} onPress={() => setAuditStatusFilter(status)} />
          ))}
        </View>
        <View style={styles.row}>
          {(["all", "grounded", "fallback"] as AuditConfidenceFilter[]).map((confidence) => (
            <Pill key={confidence} label={confidence} active={auditConfidenceFilter === confidence} onPress={() => setAuditConfidenceFilter(confidence)} />
          ))}
        </View>
        {filteredAudits.length ? (
          filteredAudits.map((audit) => (
            <View key={audit.id} style={styles.reviewItem}>
              <View style={styles.row}>
                <Pill label={audit.reviewStatus ?? "unreviewed"} active={audit.reviewStatus !== "good"} />
                <Pill label={audit.confidence} />
                <Pill label={`chars ${audit.questionLength}`} />
              </View>
              <AppText muted>
                fallback: {String(audit.fallbackUsed)} - guides: {audit.matchedGuideSlugs.join(", ") || "none"}
              </AppText>
              <View style={styles.actions}>
                <AppButton title="Good" icon="checkmark-circle-outline" variant="secondary" onPress={() => markAudit(audit, "good")} style={styles.action} />
                <AppButton title="Needs fix" icon="build-outline" variant="ghost" onPress={() => markAudit(audit, "needs_fix")} style={styles.action} />
                <AppButton title="Unsafe" icon="alert-circle-outline" variant="danger" onPress={() => markAudit(audit, "unsafe")} style={styles.action} />
              </View>
            </View>
          ))
        ) : (
          <AppText muted>{audits.length ? "No audit rows match the selected filters." : "No remote Msaidizi audit rows yet."}</AppText>
        )}
      </AppCard>
    </Screen>
  );
}

function MetricList({ title, items }: { title: string; items: { label: string; count: number }[] }) {
  return (
    <AppCard>
      <AppText variant="h3">{title}</AppText>
      {items.length ? (
        items.map((item) => (
          <AppText key={item.label} muted>
            {item.label}: {item.count}
          </AppText>
        ))
      ) : (
        <AppText muted>No data yet.</AppText>
      )}
    </AppCard>
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
  },
  reviewItem: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#DDE7E2"
  }
});
