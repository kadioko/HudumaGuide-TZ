import { router, useLocalSearchParams } from "expo-router";
import { Alert, Share, StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { ChecklistRow } from "@/components/ChecklistRow";
import { InfoBanner } from "@/components/InfoBanner";
import { Pill } from "@/components/Pill";
import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { TextField } from "@/components/TextField";
import { spacing } from "@/constants/theme";
import { scheduleLocalReminder } from "@/services/reminderService";
import { useAppStore } from "@/store/useAppStore";
import { createBusinessComplianceReminders } from "@/utils/businessCompliance";
import { formatDate, legalTaxNotice, pick, trustNotice } from "@/utils/copy";

export default function BusinessRoadmapScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const language = useAppStore((state) => state.language);
  const plans = useAppStore((state) => state.businessPlans);
  const reminders = useAppStore((state) => state.reminders);
  const addReminder = useAppStore((state) => state.addReminder);
  const toggleBusinessRoadmapStep = useAppStore((state) => state.toggleBusinessRoadmapStep);
  const updateBusinessRoadmapStepNote = useAppStore((state) => state.updateBusinessRoadmapStepNote);
  const plan = plans.find((item) => item.id === planId) ?? plans[0];

  if (!plan) {
    return (
      <Screen>
        <AppCard>
          <AppText variant="h2">No roadmap yet</AppText>
          <AppText muted>Create a business plan first.</AppText>
          <AppButton title="Start wizard" onPress={() => router.replace("/biashara/wizard")} />
        </AppCard>
      </Screen>
    );
  }

  const progress = plan.roadmap.length ? Math.round((plan.completedStepIds.length / plan.roadmap.length) * 100) : 0;
  const linkedReminderCount = reminders.filter((reminder) => reminder.linkedBusinessPlanId === plan.id).length;

  async function createComplianceCalendar() {
    const suggestions = createBusinessComplianceReminders(plan).filter(
      (suggestion) =>
        !reminders.some(
          (reminder) => reminder.linkedBusinessPlanId === plan.id && reminder.title === suggestion.title
        )
    );

    if (!suggestions.length) {
      Alert.alert("Compliance calendar", "Suggested reminders already exist for this business plan.");
      return;
    }

    for (const reminder of suggestions) {
      addReminder(reminder);
      await scheduleLocalReminder(reminder);
    }

    Alert.alert("Compliance calendar", `${suggestions.length} reminders added. Confirm dates with official sources.`);
  }

  async function shareRoadmap() {
    const lines = plan.roadmap.map((step, index) => {
      const done = plan.completedStepIds.includes(step.id);
      const note = plan.roadmapStepNotes?.[step.id];
      return [`${done ? "[x]" : "[ ]"} ${index + 1}. ${pick(language, step.titleSw, step.titleEn)}`, note ? `   Note: ${note}` : undefined]
        .filter(Boolean)
        .join("\n");
    });

    await Share.share({
      message: [
        `${plan.businessName} - BiasharaStart TZ Roadmap`,
        `Progress: ${plan.completedStepIds.length}/${plan.roadmap.length}`,
        `Structure: ${plan.structure.replace("_", " ")}`,
        "",
        ...lines,
        "",
        legalTaxNotice,
        trustNotice
      ].join("\n")
    });
  }

  return (
    <Screen>
      <SectionHeader
        title={plan.businessName}
        subtitle={`${plan.industry} - ${plan.city} - ${plan.completedStepIds.length}/${plan.roadmap.length} steps complete`}
      />
      <ProgressBar value={progress} />

      <AppCard>
        <AppText variant="h3">
          Your business setup progress: {plan.completedStepIds.length}/{plan.roadmap.length} steps complete.
        </AppText>
        <AppText muted>
          {language === "sw"
            ? "Roadmap hii ni mwongozo wa kujiandaa. Hakiki mahitaji rasmi kabla ya kuwasilisha maombi."
            : "This roadmap helps you prepare. Confirm official requirements before submitting applications."}
        </AppText>
      </AppCard>

      <AppCard>
        <View style={styles.cardHeader}>
          <View style={styles.cardCopy}>
            <AppText variant="h3">{language === "sw" ? "Compliance calendar" : "Compliance calendar"}</AppText>
            <AppText muted>
              {language === "sw"
                ? "Tengeneza reminders za rekodi, kodi na leseni bila kudai tarehe rasmi."
                : "Create record, tax, and licence reminders without claiming official dates."}
            </AppText>
          </View>
          <Pill label={`${linkedReminderCount} reminders`} />
        </View>
        <AppButton
          title={language === "sw" ? "Create suggested reminders" : "Create suggested reminders"}
          icon="calendar-outline"
          variant="secondary"
          onPress={createComplianceCalendar}
        />
      </AppCard>

      <AppCard>
        {plan.roadmap.map((step, index) => (
          <View key={step.id} style={styles.roadmapItem}>
            <ChecklistRow
              title={`${language === "sw" ? "Hatua ya" : "Step"} ${index + 1}: ${pick(language, step.titleSw, step.titleEn)}`}
              description={pick(language, step.descriptionSw, step.descriptionEn)}
              checked={plan.completedStepIds.includes(step.id)}
              onToggle={() => toggleBusinessRoadmapStep(plan.id, step.id)}
            />
            {step.linkedServiceSlug ? (
              <AppButton
                title={language === "sw" ? "Fungua guide husika" : "Open related guide"}
                icon="open-outline"
                variant="secondary"
                onPress={() => router.push(`/services/${step.linkedServiceSlug}`)}
              />
            ) : null}
            {plan.roadmapStepCompletedAt?.[step.id] ? (
              <AppText variant="small" muted>
                Completed: {formatDate(plan.roadmapStepCompletedAt[step.id])}
              </AppText>
            ) : null}
            <TextField
              label={language === "sw" ? "Step note" : "Step note"}
              value={plan.roadmapStepNotes?.[step.id] ?? ""}
              onChangeText={(note) => updateBusinessRoadmapStepNote(plan.id, step.id, note)}
              multiline
            />
          </View>
        ))}
      </AppCard>

      <AppButton
        title="View business profile"
        variant="secondary"
        icon="business-outline"
        onPress={() => router.push({ pathname: "/biashara/profile", params: { planId: plan.id } })}
      />
      <AppButton title={language === "sw" ? "Share roadmap" : "Share roadmap"} icon="share-social-outline" variant="secondary" onPress={shareRoadmap} />
      <InfoBanner body={legalTaxNotice} tone="warning" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  roadmapItem: {
    gap: spacing.sm
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md
  },
  cardCopy: {
    flex: 1,
    gap: spacing.xs
  }
});
