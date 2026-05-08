import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { ChecklistRow } from "@/components/ChecklistRow";
import { InfoBanner } from "@/components/InfoBanner";
import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { spacing } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { legalTaxNotice, pick } from "@/utils/copy";

export default function BusinessRoadmapScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const language = useAppStore((state) => state.language);
  const plans = useAppStore((state) => state.businessPlans);
  const toggleBusinessRoadmapStep = useAppStore((state) => state.toggleBusinessRoadmapStep);
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
          </View>
        ))}
      </AppCard>

      <AppButton
        title="View business profile"
        variant="secondary"
        icon="business-outline"
        onPress={() => router.push({ pathname: "/biashara/profile", params: { planId: plan.id } })}
      />
      <InfoBanner body={legalTaxNotice} tone="warning" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  roadmapItem: {
    gap: spacing.sm
  }
});
