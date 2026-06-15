import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { EmptyState } from "@/components/EmptyState";
import { MetricTile } from "@/components/MetricTile";
import { Pill } from "@/components/Pill";
import { RecordSyncPill } from "@/components/RecordSyncPill";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { SyncBanner } from "@/components/SyncBanner";
import { colors, spacing } from "@/constants/theme";
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
      <AppCard style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="alarm-outline" size={24} color={colors.green} />
        </View>
        <View style={styles.flex}>
          <SectionHeader
            title={language === "sw" ? "Vikumbusho" : "Reminders"}
            subtitle={language === "sw" ? "Kodi, leseni, nyaraka na follow-up." : "Tax, licence, documents, and follow-ups."}
          />
        </View>
      </AppCard>
      <SyncBanner />
      <View style={styles.actions}>
        <AppButton title={language === "sw" ? "Weka reminder" : "Create reminder"} icon="add-circle-outline" onPress={() => router.push("/reminders/create")} style={styles.actionButton} />
        <AppButton title={language === "sw" ? "Notifications" : "Notifications"} icon="notifications-outline" variant="secondary" onPress={() => router.push("/notifications/settings")} style={styles.actionButton} />
      </View>

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
                <RecordSyncPill createdAt={reminder.createdAt} updatedAt={reminder.updatedAt} />
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
                  Alert.alert(language === "sw" ? "Futa reminder" : "Delete reminder", language === "sw" ? "Ondoa reminder hii?" : "Remove this reminder?", [
                    { text: language === "sw" ? "Ghairi" : "Cancel", style: "cancel" },
                    { text: language === "sw" ? "Futa" : "Delete", style: "destructive", onPress: () => deleteReminder(reminder.id) }
                  ])
                }
              />
            </AppCard>
          ))
        ) : (
          <>
            <EmptyState
              icon="alarm-outline"
              title={language === "sw" ? "Hakuna reminders hapa" : "No reminders here"}
              body={language === "sw" ? "Badilisha filter au weka reminder kwa deadline, renewal au follow-up." : "Change the filter or create reminders for deadlines, renewals, or follow-ups."}
            />
            <AppButton title={language === "sw" ? "Weka reminder ya kwanza" : "Create first reminder"} icon="add-circle-outline" onPress={() => router.push("/reminders/create")} />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  heroIcon: {
    width: 48,
    height: 48,
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
