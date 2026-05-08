import { router } from "expo-router";
import { Alert, StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { EmptyState } from "@/components/EmptyState";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { spacing } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/utils/copy";

export default function RemindersScreen() {
  const language = useAppStore((state) => state.language);
  const reminders = useAppStore((state) => state.reminders);
  const deleteReminder = useAppStore((state) => state.deleteReminder);

  return (
    <Screen>
      <SectionHeader
        title={language === "sw" ? "Reminders" : "Reminders"}
        subtitle={language === "sw" ? "Kodi, leseni, documents na follow-up." : "Tax, licence, documents, and follow-ups."}
      />
      <AppButton title={language === "sw" ? "Create reminder" : "Create reminder"} icon="add-circle-outline" onPress={() => router.push("/reminders/create")} />

      <View style={styles.stack}>
        {reminders.length ? (
          reminders.map((reminder) => (
            <AppCard key={reminder.id}>
              <View style={styles.row}>
                <Pill label={reminder.category} />
                <Pill label={reminder.repeat === "none" ? "one-time" : reminder.repeat} />
              </View>
              <AppText variant="h3">{reminder.title}</AppText>
              <AppText muted>{formatDate(reminder.date)}</AppText>
              {reminder.notes ? <AppText muted>{reminder.notes}</AppText> : null}
              <AppButton
                title={language === "sw" ? "Delete" : "Delete"}
                variant="ghost"
                icon="trash-outline"
                onPress={() =>
                  Alert.alert("Delete reminder", "Remove this reminder?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: () => deleteReminder(reminder.id) }
                  ])
                }
              />
            </AppCard>
          ))
        ) : (
          <EmptyState
            icon="alarm-outline"
            title={language === "sw" ? "Hakuna reminders bado" : "No reminders yet"}
            body={language === "sw" ? "Weka reminder kwa deadline, renewal au follow-up." : "Create reminders for deadlines, renewals, or follow-ups."}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  }
});
