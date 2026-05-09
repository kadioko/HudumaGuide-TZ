import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { DocumentCard } from "@/components/DocumentCard";
import { EmptyState } from "@/components/EmptyState";
import { InfoBanner } from "@/components/InfoBanner";
import { MetricTile } from "@/components/MetricTile";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { colors, spacing } from "@/constants/theme";
import { documentFolders } from "@/data/documentFolders";
import { useAppStore } from "@/store/useAppStore";
import { DocumentFolder } from "@/types";
import { getDocumentStatus, getExpiringDocuments } from "@/utils/documents";

export default function DocumentsScreen() {
  const [selectedFolder, setSelectedFolder] = useState<DocumentFolder | "All">("All");
  const language = useAppStore((state) => state.language);
  const documents = useAppStore((state) => state.userDocuments);
  const deleteDocument = useAppStore((state) => state.deleteDocument);

  const filteredDocuments = useMemo(() => {
    if (selectedFolder === "All") {
      return documents;
    }

    return documents.filter((document) => document.folder === selectedFolder);
  }, [documents, selectedFolder]);

  const expiringSoon = getExpiringDocuments(documents);
  const expiredCount = documents.filter((document) => getDocumentStatus(document).tone === "danger").length;

  return (
    <Screen>
      <SectionHeader
        title={language === "sw" ? "Document Vault" : "Document Vault"}
        subtitle={
          language === "sw"
            ? "Hifadhi metadata, expiry na reminders za nyaraka zako."
            : "Track document metadata, expiry dates, and reminders."
        }
      />

      <InfoBanner
        title="Privacy-first MVP"
        body="This version stores document records locally on your device. File upload to Supabase Storage should be enabled only after login, private buckets, and RLS are live."
        tone="warning"
      />

      <View style={styles.metrics}>
        <MetricTile label="Documents" value={String(documents.length)} icon="folder-open-outline" />
        <MetricTile label="Expiring" value={String(expiringSoon.length)} icon="time-outline" tone="gold" />
        <MetricTile label="Expired" value={String(expiredCount)} icon="alert-circle-outline" tone="blue" />
      </View>

      <AppButton title="Add document" icon="add-circle-outline" onPress={() => router.push("/documents/upload")} />

      <View style={styles.folderRow}>
        <Pill label="All" active={selectedFolder === "All"} onPress={() => setSelectedFolder("All")} />
        {documentFolders.map((folder) => (
          <Pill key={folder} label={folder} active={selectedFolder === folder} onPress={() => setSelectedFolder(folder)} />
        ))}
      </View>

      <View style={styles.grid}>
        {documentFolders.map((folder) => {
          const count = documents.filter((document) => document.folder === folder).length;
          return (
            <AppCard key={folder} style={styles.folder} muted={selectedFolder !== "All" && selectedFolder !== folder}>
              <Ionicons name="folder-open-outline" size={26} color={colors.green} />
              <AppText variant="small" style={styles.folderTitle}>
                {folder}
              </AppText>
              <AppText variant="tiny" muted>
                {count} records
              </AppText>
            </AppCard>
          );
        })}
      </View>

      <View style={styles.stack}>
        <SectionHeader title={selectedFolder === "All" ? "All documents" : selectedFolder} />
        {filteredDocuments.length ? (
          filteredDocuments.map((document) => (
            <DocumentCard key={document.id} document={document} onDelete={() => deleteDocument(document.id)} />
          ))
        ) : (
          <EmptyState
            icon="document-text-outline"
            title={language === "sw" ? "Hakuna document records" : "No document records"}
            body={
              language === "sw"
                ? "Ongeza record ya document ili ufuatilie expiry na reminders."
                : "Add a document record to track expiry dates and reminders."
            }
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: "row",
    gap: spacing.sm
  },
  folderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  folder: {
    width: "47%",
    minHeight: 112,
    justifyContent: "center"
  },
  folderTitle: {
    fontWeight: "800"
  },
  stack: {
    gap: spacing.md
  }
});
