import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { EmptyState } from "@/components/EmptyState";
import { InfoBanner } from "@/components/InfoBanner";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { TextField } from "@/components/TextField";
import { AdminFeedbackReport, loadAdminFeedbackReports, updateFeedbackStatus } from "@/services/adminContentService";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/utils/copy";

type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

export default function AdminReportsScreen() {
  const reports = useAppStore((state) => state.feedbackReports);
  const [remoteReports, setRemoteReports] = useState<AdminFeedbackReport[]>([]);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [resolutionNotes, setResolutionNotes] = useState("");
  const visibleReports = remoteReports.length ? remoteReports : reports.map((report) => ({ ...report, category: report.category ?? "outdated_info", status: "open" as const }));
  const openCount = useMemo(() => visibleReports.length, [visibleReports.length]);

  useEffect(() => {
    void loadAdminFeedbackReports()
      .then(setRemoteReports)
      .catch((error) => setLoadError(error instanceof Error ? error.message : "Unable to load remote reports."));
  }, []);

  async function setStatus(id: string, status: ReportStatus) {
    try {
      await updateFeedbackStatus(id, status, resolutionNotes || undefined);
      Alert.alert("Report updated", `Marked as ${status}.`);
    } catch (error) {
      Alert.alert("Planning mode", error instanceof Error ? error.message : "Remote report update needs Supabase admin access.");
    }
  }

  return (
    <Screen>
      <SectionHeader title="Support review queue" subtitle={`${openCount} reports captured in this build.`} />
      <InfoBanner
        title="Review flow"
        body="Open reports should move through reviewing, resolved, or dismissed. Use reviewer notes to capture what changed and whether guide verification must expire."
      />
      {loadError ? <InfoBanner title="Remote load issue" body={loadError} tone="warning" /> : null}
      <TextField label="Resolution notes" value={resolutionNotes} onChangeText={setResolutionNotes} multiline />

      {visibleReports.length ? (
        visibleReports.map((report) => (
          <AppCard key={report.id}>
            <Pill label={report.category ?? "outdated_info"} active />
            <Pill label={report.serviceSlug ?? "general"} />
            <AppText variant="h3">{report.category === "outdated_info" ? "Outdated info report" : "Support request"}</AppText>
            <Pill label={report.status} />
            <AppText muted>{report.message}</AppText>
            <AppText variant="small" muted>
              {formatDate(report.createdAt)}
            </AppText>
            <AppButton title="Mark reviewing" variant="secondary" onPress={() => setStatus(report.id, "reviewing")} />
            <AppButton title="Mark resolved" icon="checkmark-circle-outline" onPress={() => setStatus(report.id, "resolved")} />
            <AppButton title="Dismiss" variant="ghost" onPress={() => setStatus(report.id, "dismissed")} />
          </AppCard>
        ))
      ) : (
        <EmptyState
          icon="flag-outline"
          title="No reports yet"
          body="Reports submitted from service guides will appear here for admin review."
        />
      )}
    </Screen>
  );
}
