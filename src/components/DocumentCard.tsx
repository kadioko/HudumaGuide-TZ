import { Ionicons } from "@expo/vector-icons";
import { Alert, StyleSheet, View } from "react-native";
import { colors, radii, spacing } from "@/constants/theme";
import { UserDocument } from "@/types";
import { formatDate } from "@/utils/copy";
import { getDocumentRenewalChecklist, getDocumentStatus } from "@/utils/documents";
import { AppButton } from "./AppButton";
import { AppCard } from "./AppCard";
import { AppText } from "./AppText";
import { Pill } from "./Pill";
import { RecordSyncPill } from "./RecordSyncPill";

type DocumentCardProps = {
  document: UserDocument;
  onDelete: () => void;
  onOpen?: () => void;
  onReplaceFile?: () => void;
  onDeleteFile?: () => void;
  onDeleteMetadataOnly?: () => void;
};

export function DocumentCard({ document, onDelete, onOpen, onReplaceFile, onDeleteFile, onDeleteMetadataOnly }: DocumentCardProps) {
  const status = getDocumentStatus(document);
  const renewalChecklist = getDocumentRenewalChecklist(document);
  const toneColor =
    status.tone === "danger"
      ? colors.red
      : status.tone === "warning"
        ? colors.warning
        : status.tone === "success"
          ? colors.success
          : colors.textMuted;

  return (
    <AppCard>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="document-text-outline" size={22} color={colors.green} />
        </View>
        <View style={styles.copy}>
          <AppText variant="h3">{document.title}</AppText>
          <AppText variant="small" muted>
            {document.documentType} - {document.folder}
          </AppText>
        </View>
      </View>

      <View style={styles.pills}>
        <RecordSyncPill createdAt={document.createdAt} updatedAt={document.updatedAt} />
        <Pill label={status.label} />
        {document.expiresOn ? <Pill label={`Expires ${formatDate(document.expiresOn)}`} /> : null}
      </View>

      {document.reminderOn ? (
        <AppText variant="small" color={colors.green} style={styles.bold}>
          Reminder: {formatDate(document.reminderOn)}
        </AppText>
      ) : null}

      {document.notes ? <AppText muted>{document.notes}</AppText> : null}
      <View style={styles.renewal}>
        <AppText variant="small" style={styles.bold}>Renewal checklist</AppText>
        {renewalChecklist.slice(0, 3).map((item) => (
          <AppText key={item} variant="small" muted>
            - {item}
          </AppText>
        ))}
      </View>
      {document.fileName ? (
        <AppText variant="small" color={toneColor}>
          File reference: {document.fileName}
        </AppText>
      ) : null}

      <View style={styles.actions}>
        {document.fileName && onOpen ? (
          <AppButton title="Preview/download" icon="open-outline" variant="secondary" onPress={onOpen} style={styles.actionButton} />
        ) : null}
        {onReplaceFile ? (
          <AppButton title={document.fileName ? "Replace file" : "Attach file"} icon="attach-outline" variant="secondary" onPress={onReplaceFile} style={styles.actionButton} />
        ) : null}
      </View>
      {document.fileName && onDeleteFile ? (
        <AppButton
          title="Delete file only"
          icon="close-circle-outline"
          variant="ghost"
          onPress={() =>
            Alert.alert("Delete file", "Remove the uploaded file but keep this document record?", [
              { text: "Cancel", style: "cancel" },
              { text: "Delete file", style: "destructive", onPress: onDeleteFile }
            ])
          }
        />
      ) : null}
      {onDeleteMetadataOnly ? (
        <AppButton
          title="Delete metadata only"
          icon="remove-circle-outline"
          variant="ghost"
          onPress={() =>
            Alert.alert(
              "Delete metadata only",
              document.fileName
                ? "Remove the local document record and linked reminders, but leave the uploaded file reference in remote Storage cleanup scope."
                : "Remove the local document record and linked reminders. No uploaded file reference is attached.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Delete metadata", style: "destructive", onPress: onDeleteMetadataOnly }
              ]
            )
          }
        />
      ) : null}

      <AppButton
        title={document.fileName ? "Delete file and metadata" : "Delete metadata"}
        icon="trash-outline"
        variant="ghost"
        onPress={() =>
          Alert.alert("Delete document", document.fileName ? "Remove the uploaded file, document record, and linked reminder?" : "Remove this document record and linked reminder?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: onDelete }
          ])
        }
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.greenSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    flex: 1,
    gap: 2
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  bold: {
    fontWeight: "800"
  },
  renewal: {
    gap: spacing.xs
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  actionButton: {
    flex: 1
  }
});
