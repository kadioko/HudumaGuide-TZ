import { useLocalSearchParams } from "expo-router";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { useAppStore } from "@/store/useAppStore";
import { getBusinessCostItems } from "@/utils/businessCompliance";
import { legalTaxNotice, pick } from "@/utils/copy";

export default function BusinessProfileScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const language = useAppStore((state) => state.language);
  const plans = useAppStore((state) => state.businessPlans);
  const reminders = useAppStore((state) => state.reminders);
  const plan = plans.find((item) => item.id === planId) ?? plans[0];

  if (!plan) {
    return (
      <Screen>
        <AppCard>
          <AppText variant="h2">No business profile</AppText>
        </AppCard>
      </Screen>
    );
  }

  const costItems = getBusinessCostItems(plan);
  const linkedReminderCount = reminders.filter((reminder) => reminder.linkedBusinessPlanId === plan.id).length;

  return (
    <Screen>
      <SectionHeader title="Business profile" subtitle={plan.businessName} />
      <AppCard>
        <Pill label={plan.structure.replace("_", " ")} active />
        <AppText variant="h3">Owner</AppText>
        <AppText muted>{plan.ownerName}</AppText>
        <AppText variant="h3">Industry</AppText>
        <AppText muted>{plan.industry}</AppText>
        <AppText variant="h3">Region/city</AppText>
        <AppText muted>{plan.city}</AppText>
        <AppText variant="h3">Registration status</AppText>
        <AppText muted>Planning</AppText>
        <AppText variant="h3">TIN status</AppText>
        <AppText muted>{plan.answers.hasTin ? "Already has TIN" : "Needs TIN step"}</AppText>
        <AppText variant="h3">Licence status</AppText>
        <AppText muted>{plan.answers.needsLicence ? "Likely needs licence check" : "Not marked as needed"}</AppText>
        <AppText variant="h3">Compliance reminders</AppText>
        <AppText muted>{linkedReminderCount} reminders linked to this plan</AppText>
      </AppCard>

      <AppCard>
        <AppText variant="h3">{language === "sw" ? "Cost planning checklist" : "Cost planning checklist"}</AppText>
        <AppText muted>
          {language === "sw"
            ? "Hizi ni cost buckets za kupanga bajeti. Si ada rasmi."
            : "These are planning buckets, not official fees."}
        </AppText>
        {costItems.map((item) => (
          <AppCard key={item.id} muted>
            <AppText variant="h3">{pick(language, item.titleSw, item.titleEn)}</AppText>
            <AppText muted>{pick(language, item.noteSw, item.noteEn)}</AppText>
          </AppCard>
        ))}
      </AppCard>

      <InfoBanner body={legalTaxNotice} tone="warning" />
    </Screen>
  );
}
