import { useLocalSearchParams } from "expo-router";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { useAppStore } from "@/store/useAppStore";

export default function BusinessProfileScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const plans = useAppStore((state) => state.businessPlans);
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
      </AppCard>
    </Screen>
  );
}
