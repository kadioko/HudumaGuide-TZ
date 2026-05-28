import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { TextField } from "@/components/TextField";
import { colors, radii, spacing } from "@/constants/theme";
import { requestReminderPermission } from "@/services/reminderService";
import { useAppStore } from "@/store/useAppStore";

export default function NotificationSettingsScreen() {
  const preferences = useAppStore((state) => state.notificationPreferences);
  const updateNotificationPreferences = useAppStore((state) => state.updateNotificationPreferences);

  async function enableNotifications() {
    await requestReminderPermission();
    updateNotificationPreferences({ ...preferences, permissionEducationSeen: true });
  }

  function togglePreReminderDay(day: number) {
    const current = preferences.defaultPreReminderDays;
    const next = current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort((a, b) => b - a);
    updateNotificationPreferences({ ...preferences, defaultPreReminderDays: next });
  }

  return (
    <Screen>
      <SectionHeader
        title="Notification settings"
        subtitle="Control reminder timing without noisy engagement."
      />

      <InfoBanner
        title="Permission education"
        body="HudumaGuide TZ uses local notifications for reminders you create. Push notifications for verified content updates can come later and should stay opt-in."
      />

      <AppButton title="Enable/check notification permission" icon="notifications-outline" onPress={enableNotifications} />

      <AppCard>
        <AppText variant="h3">Default pre-deadline alerts</AppText>
        <AppText muted>Used when a reminder does not define its own alert timing.</AppText>
        <View style={styles.row}>
          {[7, 1].map((day) => (
            <Pressable
              key={day}
              accessibilityRole="button"
              onPress={() => togglePreReminderDay(day)}
              style={[styles.choice, preferences.defaultPreReminderDays.includes(day) && styles.choiceActive]}
            >
              <AppText color={preferences.defaultPreReminderDays.includes(day) ? colors.surface : colors.text} variant="small" style={styles.bold}>
                {day} day{day === 1 ? "" : "s"} before
              </AppText>
            </Pressable>
          ))}
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="h3">Quiet hours</AppText>
        <AppText muted>Notifications scheduled inside quiet hours move to the quiet-hours end time.</AppText>
        <View style={styles.row}>
          <AppButton
            title={preferences.quietHoursEnabled ? "Quiet hours on" : "Quiet hours off"}
            variant={preferences.quietHoursEnabled ? "primary" : "secondary"}
            onPress={() => updateNotificationPreferences({ ...preferences, quietHoursEnabled: !preferences.quietHoursEnabled })}
            style={styles.flex}
          />
        </View>
        <TextField
          label="Start"
          value={preferences.quietHoursStart}
          onChangeText={(quietHoursStart) => updateNotificationPreferences({ ...preferences, quietHoursStart })}
          placeholder="21:00"
        />
        <TextField
          label="End"
          value={preferences.quietHoursEnd}
          onChangeText={(quietHoursEnd) => updateNotificationPreferences({ ...preferences, quietHoursEnd })}
          placeholder="07:00"
        />
      </AppCard>

      <AppCard muted>
        <AppText variant="h3">Later push notifications</AppText>
        <AppText muted>
          Future push notifications should be reserved for verified content updates, major safety notices, and user-requested account alerts.
        </AppText>
      </AppCard>

      <AppButton title="Back to reminders" variant="secondary" icon="arrow-back-outline" onPress={() => router.replace("/(tabs)/reminders")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  choice: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  choiceActive: {
    backgroundColor: colors.green,
    borderColor: colors.green
  },
  bold: {
    fontWeight: "800"
  },
  flex: {
    flex: 1
  }
});
