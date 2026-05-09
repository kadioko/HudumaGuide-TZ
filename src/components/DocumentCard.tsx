import { Ionicons } from "@expo/vector-icons";
import { Alert, StyleSheet, View } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { UserDocument } from "@/types";
import { formatDate } from "@/utils/copy";
import { getDocumentStatus } from "@/utils/documents";
import { AppButton } from "./AppButton";
import { AppCard } from "./AppCard";
import { AppText } from "./AppText";
import { Pill } from "./Pill";

type DocumentCardProps = {
  document: UserDocument;
  onDelete: () => void;
};

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const status = getDocumentStatus(document);
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
        <Pill label={status.label} />
        {document.expiresOn ? <Pill label={`Expires ${formatDate(document.expiresOn)}`} /> : null}
      </View>

      {document.reminderOn ? (
        <AppText variant="small" color={colors.green} style={styles.bold}>
          Reminder: {formatDate(document.reminderOn)}
        </AppText>
      ) : null}

      {document.notes ? <AppText muted>{document.notes}</AppText> : null}
      {document.fileName ? (
        <AppText variant="small" color={toneColor}>
          File reference: {document.fileName}
        </AppText>
      ) : null}

      <AppButton
        title="Delete"
        icon="trash-outline"
        variant="ghost"
        onPress={() =>
          Alert.alert("Delete document", "Remove this document record and linked reminder?", [
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
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
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
  }
});
