import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { colors, spacing } from "@/constants/theme";
import { businessStructures } from "@/data/businessStructures";
import { useAppStore } from "@/store/useAppStore";
import { pick, trustNotice } from "@/utils/copy";

export default function BiasharaScreen() {
  const language = useAppStore((state) => state.language);
  const businessPlans = useAppStore((state) => state.businessPlans);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="briefcase-outline" size={30} color={colors.surface} />
        </View>
        <View style={styles.copy}>
          <AppText variant="title">BiasharaStart TZ</AppText>
          <AppText muted>
            {language === "sw"
              ? "Pata roadmap rahisi ya kusajili na kupanga biashara yako."
              : "Get a simple roadmap to register and organize your business."}
          </AppText>
        </View>
      </View>

      <AppButton
        title={language === "sw" ? "Start New Business Plan" : "Start New Business Plan"}
        icon="add-circle-outline"
        onPress={() => router.push("/biashara/wizard")}
      />

      <View style={styles.stack}>
        <SectionHeader title={language === "sw" ? "Saved business plans" : "Saved business plans"} />
        {businessPlans.length ? (
          businessPlans.map((plan) => {
            const progress = plan.roadmap.length ? Math.round((plan.completedStepIds.length / plan.roadmap.length) * 100) : 0;
            return (
              <AppCard key={plan.id}>
                <AppText variant="h3">{plan.businessName}</AppText>
                <AppText muted>
                  {plan.industry} - {plan.city}
                </AppText>
                <AppText variant="small" color={colors.green} style={styles.bold}>
                  {language === "sw" ? "Business setup progress" : "Business setup progress"}: {plan.completedStepIds.length}/{plan.roadmap.length}
                </AppText>
                <ProgressBar value={progress} />
                <AppButton
                  title={language === "sw" ? "Fungua roadmap" : "Open roadmap"}
                  variant="secondary"
                  icon="map-outline"
                  onPress={() => router.push({ pathname: "/biashara/roadmap", params: { planId: plan.id } })}
                />
              </AppCard>
            );
          })
        ) : (
          <AppCard muted>
            <AppText variant="h3">{language === "sw" ? "Hakuna plan bado" : "No plan yet"}</AppText>
            <AppText muted>
              {language === "sw"
                ? "Jibu maswali machache ili upate hatua zako za kuanza."
                : "Answer a few questions to get your startup steps."}
            </AppText>
          </AppCard>
        )}
      </View>

      <View style={styles.stack}>
        <SectionHeader title={language === "sw" ? "Aina za muundo wa biashara" : "Business structures"} />
        {businessStructures.slice(0, 4).map((structure) => (
          <AppCard key={structure.id}>
            <AppText variant="h3">{pick(language, structure.titleSw, structure.titleEn)}</AppText>
            <AppText muted>{pick(language, structure.bestForSw, structure.bestForEn)}</AppText>
            <AppText variant="small" color={colors.green} style={styles.bold}>
              {language === "sw" ? "Complexity" : "Complexity"}: {structure.complexity}
            </AppText>
          </AppCard>
        ))}
      </View>

      <InfoBanner title="Independent guide" body={trustNotice} tone="warning" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  icon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    flex: 1,
    gap: spacing.xs
  },
  stack: {
    gap: spacing.md
  },
  bold: {
    fontWeight: "800"
  }
});
