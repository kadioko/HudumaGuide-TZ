import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
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
import { SyncBanner } from "@/components/SyncBanner";
import { documentUploadConfig } from "@/config/uploads";
import { colors, spacing } from "@/constants/theme";
import { documentFolders } from "@/data/documentFolders";
import { deleteDocumentFile, openDocumentFile, pickDocumentFile, uploadDocumentFile } from "@/services/documentStorageService";
import { useAppStore } from "@/store/useAppStore";
import { DocumentFolder } from "@/types";
import { getDocumentNextAction, getDocumentStatus, getExpiringDocuments } from "@/utils/documents";

export default function DocumentsScreen() {
  const { width } = useWindowDimensions();
  const isNarrow = width < 430;
  const [selectedFolder, setSelectedFolder] = useState<DocumentFolder | "All">("All");
  const language = useAppStore((state) => state.language);
  const documents = useAppStore((state) => state.userDocuments);
  const deleteDocument = useAppStore((state) => state.deleteDocument);
  const updateDocument = useAppStore((state) => state.updateDocument);
  const userProfile = useAppStore((state) => state.userProfile);

  const filteredDocuments = useMemo(() => {
    if (selectedFolder === "All") {
      return documents;
    }

    return documents.filter((document) => document.folder === selectedFolder);
  }, [documents, selectedFolder]);

  const expiringSoon = getExpiringDocuments(documents);
  const expiredCount = documents.filter((document) => getDocumentStatus(document).tone === "danger").length;
  const fileBackedRecords = documents.filter((document) => document.fileName).length;
  const storageCleanupQueue = documents.filter((document) => document.fileName && !userProfile).length;
  const allowedFileTypes = Object.values(documentUploadConfig.allowedFileTypes).map((type) => type.toUpperCase()).join(", ");

  return (
    <Screen>
      <AppCard style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="folder-open-outline" size={25} color={colors.green} />
        </View>
        <View style={styles.flex}>
          <SectionHeader
            title={language === "sw" ? "Document Vault" : "Document Vault"}
            subtitle={
              language === "sw"
                ? "Hifadhi metadata, expiry na reminders za nyaraka zako."
                : "Track document metadata, expiry dates, and reminders."
            }
          />
        </View>
      </AppCard>

      <InfoBanner
        title="Privacy-first MVP"
        body="Document metadata can sync after sign in. File preview, replacement, and deletion use private Supabase Storage when connected."
        tone="warning"
      />
      <SyncBanner />

      <View style={styles.metrics}>
        <MetricTile label="Documents" value={String(documents.length)} icon="folder-open-outline" />
        <MetricTile label="Expiring" value={String(expiringSoon.length)} icon="time-outline" tone="gold" />
        <MetricTile label="Expired" value={String(expiredCount)} icon="alert-circle-outline" tone="blue" />
      </View>

      <View style={styles.actions}>
        <AppButton title={language === "sw" ? "Ongeza document" : "Add document"} icon="add-circle-outline" onPress={() => router.push("/documents/upload")} style={styles.actionButton} />
        <AppButton title={language === "sw" ? "Security" : "Security"} icon="shield-checkmark-outline" variant="secondary" compact onPress={() => setSelectedFolder("All")} style={styles.actionButton} />
      </View>
      {documents.length ? (
        <InfoBanner title="Next document action" body={getDocumentNextAction(documents[0])} />
      ) : null}

      <AppCard>
        <AppText variant="h3">Vault security settings</AppText>
        <View style={styles.securityGrid}>
          <View style={isNarrow ? styles.securityStatFull : styles.securityStat}>
            <AppText variant="h3">{formatBytes(documentUploadConfig.maxBytes)}</AppText>
            <AppText variant="tiny" muted>Upload limit</AppText>
          </View>
          <View style={isNarrow ? styles.securityStatFull : styles.securityStat}>
            <AppText variant="h3">{documents.length}</AppText>
            <AppText variant="tiny" muted>Metadata records</AppText>
          </View>
          <View style={isNarrow ? styles.securityStatFull : styles.securityStat}>
            <AppText variant="h3">{fileBackedRecords}</AppText>
            <AppText variant="tiny" muted>File refs</AppText>
          </View>
          <View style={isNarrow ? styles.securityStatFull : styles.securityStat}>
            <AppText variant="h3">{storageCleanupQueue}</AppText>
            <AppText variant="tiny" muted>Cleanup queue</AppText>
          </View>
        </View>
        <AppText variant="small" muted>Allowed file types: {allowedFileTypes}</AppText>
        <View style={styles.securityActions}>
          <AppButton title="Add secure document" icon="cloud-upload-outline" variant="secondary" compact onPress={() => router.push("/documents/upload")} />
          {documents.length ? (
            <AppButton title="Delete local metadata" icon="trash-outline" variant="danger" compact onPress={confirmClearDocumentMetadata} />
          ) : null}
        </View>
      </AppCard>

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
            <Pressable
              key={folder}
              accessibilityRole="button"
              accessibilityLabel={`${folder} folder`}
              accessibilityState={{ selected: selectedFolder === folder }}
              onPress={() => setSelectedFolder(folder)}
              style={({ pressed }) => [isNarrow ? styles.folderPressableFull : styles.folderPressable, pressed && styles.pressed]}
            >
              <AppCard style={styles.folder} muted={selectedFolder !== "All" && selectedFolder !== folder}>
                <Ionicons name="folder-open-outline" size={26} color={colors.green} />
                <AppText variant="small" style={styles.folderTitle}>
                  {folder}
                </AppText>
                <AppText variant="tiny" muted>
                  {count} records
                </AppText>
              </AppCard>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.stack}>
        <SectionHeader title={selectedFolder === "All" ? "All documents" : selectedFolder} />
        {filteredDocuments.length ? (
          filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onOpen={document.fileName ? () => openDocumentFile(document.fileName as string) : undefined}
              onReplaceFile={userProfile ? () => replaceDocumentFile(document) : undefined}
              onDeleteFile={document.fileName ? () => deleteOnlyFile(document) : undefined}
              onDeleteMetadataOnly={() => deleteMetadataOnly(document)}
              onDelete={() => deleteDocumentRecord(document)}
            />
          ))
        ) : (
          <>
            <EmptyState
              icon="document-text-outline"
              title={language === "sw" ? "Hakuna document records" : "No document records"}
              body={
                language === "sw"
                  ? "Ongeza record ya document ili ufuatilie expiry na reminders."
                  : "Add a document record to track expiry dates and reminders."
              }
            />
            <AppButton title="Add first document" icon="add-circle-outline" onPress={() => router.push("/documents/upload")} />
          </>
        )}
      </View>
    </Screen>
  );

  async function replaceDocumentFile(document: (typeof documents)[number]) {
    if (!userProfile) {
      return;
    }

    const file = await pickDocumentFile();
    if (!file) {
      return;
    }

    if (document.fileName) {
      try {
        await deleteDocumentFile(document.fileName);
      } catch {
        Alert.alert("Replace file", "We could not remove the previous file. Check your connection and try again.");
        return;
      }
    }

    try {
      const storagePath = await uploadDocumentFile(file, userProfile.id, document.id);
      updateDocument({ ...document, fileName: storagePath, mimeType: file.mimeType });
    } catch {
      Alert.alert("Replace file", "We could not upload the replacement file. Check your connection and try again.");
    }
  }

  async function deleteOnlyFile(document: (typeof documents)[number]) {
    if (!document.fileName) {
      return;
    }

    try {
      await deleteDocumentFile(document.fileName);
      updateDocument({ ...document, fileName: undefined, mimeType: undefined });
    } catch {
      Alert.alert("Delete file", "We could not delete this file. Check your connection and try again.");
    }
  }

  async function deleteDocumentRecord(document: (typeof documents)[number]) {
    if (document.fileName) {
      try {
        await deleteDocumentFile(document.fileName);
      } catch {
        Alert.alert("Delete document", "We could not delete the uploaded file. Check your connection and try again.");
        return;
      }
    }

    deleteDocument(document.id);
  }

  function deleteMetadataOnly(document: (typeof documents)[number]) {
    deleteDocument(document.id);
    if (document.fileName) {
      Alert.alert(
        "Metadata deleted",
        "The local record was removed. The uploaded file reference remains a remote cleanup responsibility when Storage is connected."
      );
    }
  }

  function confirmClearDocumentMetadata() {
    Alert.alert(
      "Delete local document metadata",
      `This removes ${documents.length} document records and linked document reminders from this device. Uploaded files must still be removed from Storage when connected.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete metadata",
          style: "destructive",
          onPress: () => documents.forEach((document) => deleteDocument(document.id))
        }
      ]
    );
  }
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  }

  return `${Math.round(bytes / 1024)} KB`;
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: colors.greenSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  flex: {
    flex: 1
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm
  },
  actionButton: {
    flex: 1
  },
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
    flex: 1,
    minHeight: 112,
    justifyContent: "center"
  },
  folderPressable: {
    width: "47%",
    minWidth: 152
  },
  folderPressableFull: {
    width: "100%"
  },
  pressed: {
    opacity: 0.8,
    transform: [{ translateY: 1 }]
  },
  folderTitle: {
    fontWeight: "800"
  },
  stack: {
    gap: spacing.md
  },
  securityActions: {
    gap: spacing.sm
  },
  securityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  securityStat: {
    flexBasis: "48%",
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: spacing.xs
  },
  securityStatFull: {
    flexBasis: "100%",
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: spacing.xs
  }
});
