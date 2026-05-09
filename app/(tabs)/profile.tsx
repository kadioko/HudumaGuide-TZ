import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { spacing } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { trustNotice } from "@/utils/copy";

export default function ProfileScreen() {
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const savedGuides = useAppStore((state) => state.savedGuideSlugs.length);
  const reminders = useAppStore((state) => state.reminders.length);
  const businessPlans = useAppStore((state) => state.businessPlans.length);
  const documents = useAppStore((state) => state.userDocuments.length);

  return (
    <Screen>
      <SectionHeader title={language === "sw" ? "Profile & settings" : "Profile & settings"} subtitle="HudumaGuide TZ" />
      <AppCard>
        <AppText variant="h3">Language</AppText>
        <View style={styles.row}>
          <AppButton title="Kiswahili" variant={language === "sw" ? "primary" : "secondary"} onPress={() => setLanguage("sw")} style={styles.choice} />
          <AppButton title="English" variant={language === "en" ? "primary" : "secondary"} onPress={() => setLanguage("en")} style={styles.choice} />
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="h3">Your MVP data</AppText>
        <AppText muted>Saved guides: {savedGuides}</AppText>
        <AppText muted>Reminders: {reminders}</AppText>
        <AppText muted>Document records: {documents}</AppText>
        <AppText muted>Business plans: {businessPlans}</AppText>
      </AppCard>

      <AppCard>
        <AppText variant="h3">Privacy</AppText>
        <AppText muted>
          This MVP stores saved checklists, document records, reminders, and business plans locally on your device. Supabase Auth and private cloud storage are prepared for later.
        </AppText>
      </AppCard>

      <AppButton title="Account / login" icon="person-circle-outline" variant="secondary" onPress={() => router.push("/auth")} />
      <AppButton title="About & disclaimer" icon="information-circle-outline" variant="secondary" onPress={() => router.push("/disclaimer")} />
      <InfoBanner title="Trust notice" body={trustNotice} tone="warning" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm
  },
  choice: {
    flex: 1
  }
});
