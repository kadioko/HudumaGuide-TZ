import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { EmptyState } from "@/components/EmptyState";
import { MetricTile } from "@/components/MetricTile";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { spacing } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/utils/copy";

type ReminderFilter = "all" | "overdue" | "today" | "upcoming";

function getDateKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function getReminderStatus(date: string): Exclude<ReminderFilter, "all"> {
  const today = getDateKey(new Date().toISOString());
  const target = getDateKey(date);

  if (target < today) {
    return "overdue";
  }

  if (target === today) {
    return "today";
  }

  return "upcoming";
}

export default function RemindersScreen() {
  const [filter, setFilter] = useState<ReminderFilter>("all");
  const language = useAppStore((state) => state.language);
  const reminders = useAppStore((state) => state.reminders);
  const deleteReminder = useAppStore((state) => state.deleteReminder);
  const reminderGroups = useMemo(() => {
    const groups = {
      overdue: reminders.filter((reminder) => getReminderStatus(reminder.date) === "overdue"),
      today: reminders.filter((reminder) => getReminderStatus(reminder.date) === "today"),
      upcoming: reminders.filter((reminder) => getReminderStatus(reminder.date) === "upcoming")
    };
    const visible =
      filter === "all"
        ? [...groups.overdue, ...groups.today, ...groups.upcoming]
        : reminders.filter((reminder) => getReminderStatus(reminder.date) === filter);

    return { ...groups, visible };
  }, [filter, reminders]);

  return (
    <Screen>
      <SectionHeader
        title={language === "sw" ? "Reminders" : "Reminders"}
        subtitle={language === "sw" ? "Kodi, leseni, documents na follow-up." : "Tax, licence, documents, and follow-ups."}
      />
      <AppButton title={language === "sw" ? "Create reminder" : "Create reminder"} icon="add-circle-outline" onPress={() => router.push("/reminders/create")} />

      <View style={styles.metrics}>
        <MetricTile label={language === "sw" ? "Overdue" : "Overdue"} value={String(reminderGroups.overdue.length)} icon="alert-circle-outline" tone="gold" />
        <MetricTile label={language === "sw" ? "Leo" : "Today"} value={String(reminderGroups.today.length)} icon="calendar-outline" tone="blue" />
        <MetricTile label={language === "sw" ? "Upcoming" : "Upcoming"} value={String(reminderGroups.upcoming.length)} icon="time-outline" />
      </View>

      <View style={styles.row}>
        {(["all", "overdue", "today", "upcoming"] as ReminderFilter[]).map((item) => (
          <Pill
            key={item}
            label={item === "all" ? (language === "sw" ? "Zote" : "All") : item}
            active={filter === item}
            onPress={() => setFilter(item)}
          />
        ))}
      </View>

      <View style={styles.stack}>
        {reminderGroups.visible.length ? (
          reminderGroups.visible.map((reminder) => (
            <AppCard key={reminder.id}>
              <View style={styles.row}>
                <Pill label={getReminderStatus(reminder.date)} active={getReminderStatus(reminder.date) !== "upcoming"} />
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
            title={language === "sw" ? "Hakuna reminders hapa" : "No reminders here"}
            body={language === "sw" ? "Badilisha filter au weka reminder kwa deadline, renewal au follow-up." : "Change the filter or create reminders for deadlines, renewals, or follow-ups."}
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
  metrics: {
    flexDirection: "row",
    gap: spacing.sm
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  }
});
