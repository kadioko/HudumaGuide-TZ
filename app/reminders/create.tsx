import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, View } from "react-native";
import { z } from "zod";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { TextField } from "@/components/TextField";
import { colors, radii, spacing } from "@/constants/theme";
import { scheduleLocalReminder } from "@/services/reminderService";
import { useAppStore } from "@/store/useAppStore";
import { ReminderCategory } from "@/types";

const categories: { value: ReminderCategory; label: string }[] = [
  { value: "tax", label: "Tax" },
  { value: "licence", label: "Licence" },
  { value: "document", label: "Document" },
  { value: "service", label: "Service" },
  { value: "passport", label: "Passport" },
  { value: "driving", label: "Driving" },
  { value: "business", label: "Business" },
  { value: "custom", label: "Custom" }
];

const schema = z.object({
  title: z.string().min(2, "Enter reminder title"),
  category: z.enum(["document", "licence", "tax", "service", "passport", "driving", "business", "custom"]),
  date: z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), "Use YYYY-MM-DD format"),
  repeat: z.enum(["none", "weekly", "monthly", "yearly"]),
  preReminderMode: z.enum(["none", "1", "7", "both"]),
  notes: z.string().optional(),
  notificationEnabled: z.boolean()
});

type FormValues = z.infer<typeof schema>;

export default function CreateReminderScreen() {
  const params = useLocalSearchParams<{ title?: string; linkedServiceSlug?: string }>();
  const addReminder = useAppStore((state) => state.addReminder);
  const language = useAppStore((state) => state.language);
  const notificationPreferences = useAppStore((state) => state.notificationPreferences);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: params.title ? `Follow up: ${params.title}` : "",
      category: params.linkedServiceSlug ? "service" : "custom",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      repeat: "none",
      preReminderMode: "both",
      notes: "",
      notificationEnabled: true
    }
  });

  async function onSubmit(values: FormValues) {
    const preReminderDays =
      values.preReminderMode === "both"
        ? [7, 1]
        : values.preReminderMode === "none"
          ? []
          : [Number(values.preReminderMode)];
    const reminder = {
      id: `reminder-${Date.now()}`,
      title: values.title,
      category: values.category,
      date: values.date,
      repeat: values.repeat,
      notes: values.notes,
      notificationEnabled: values.notificationEnabled,
      preReminderDays,
      linkedServiceSlug: params.linkedServiceSlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const scheduledNotificationIds = await scheduleLocalReminder(reminder, notificationPreferences);
    addReminder({
      ...reminder,
      scheduledNotificationIds,
      lastScheduledAt: scheduledNotificationIds.length ? new Date().toISOString() : undefined
    });
    router.replace("/(tabs)/reminders");
  }

  return (
    <Screen>
      <SectionHeader
        title={language === "sw" ? "Create reminder" : "Create reminder"}
        subtitle={language === "sw" ? "Weka deadline, renewal au follow-up." : "Set a deadline, renewal, or follow-up."}
      />
      <InfoBanner body="Dates use YYYY-MM-DD for this MVP. Local notifications require device permission." />

      <AppCard>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => <TextField label="Title" value={value} onChangeText={onChange} error={errors.title?.message} />}
        />
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <TextField label="Date" value={value} onChangeText={onChange} placeholder="2026-05-30" error={errors.date?.message} />
          )}
        />
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value } }) => <TextField label="Notes" value={value} onChangeText={onChange} multiline />}
        />
      </AppCard>

      <AppCard>
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <ChoiceGroup label="Category" value={value} options={categories} onChange={onChange} />
          )}
        />
        <Controller
          control={control}
          name="repeat"
          render={({ field: { onChange, value } }) => (
            <ChoiceGroup
              label="Repeat"
              value={value}
              options={[
                { value: "none", label: "None" },
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly" }
              ]}
              onChange={onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="preReminderMode"
          render={({ field: { onChange, value } }) => (
            <ChoiceGroup
              label="Pre-deadline alerts"
              value={value}
              options={[
                { value: "both", label: "7 & 1 days" },
                { value: "7", label: "7 days" },
                { value: "1", label: "1 day" },
                { value: "none", label: "None" }
              ]}
              onChange={onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="notificationEnabled"
          render={({ field: { onChange, value } }) => (
            <ChoiceGroup
              label="Notification"
              value={value ? "on" : "off"}
              options={[
                { value: "on", label: "On" },
                { value: "off", label: "Off" }
              ]}
              onChange={(next) => onChange(next === "on")}
            />
          )}
        />
      </AppCard>

      <AppButton title="Save reminder" icon="save-outline" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
    </Screen>
  );
}

type ChoiceOption<T extends string> = {
  label: string;
  value: T;
};

function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: T;
  options: ChoiceOption<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.choiceWrapper}>
      <AppText variant="small" style={styles.choiceLabel}>
        {label}
      </AppText>
      <View style={styles.choiceGrid}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            style={[styles.choice, value === option.value && styles.choiceActive]}
          >
            <AppText variant="small" color={value === option.value ? colors.surface : colors.text} style={styles.choiceText}>
              {option.label}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  choiceWrapper: {
    gap: spacing.sm
  },
  choiceLabel: {
    fontWeight: "800"
  },
  choiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  choice: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill
  },
  choiceActive: {
    backgroundColor: colors.green,
    borderColor: colors.green
  },
  choiceText: {
    fontWeight: "800"
  }
});
