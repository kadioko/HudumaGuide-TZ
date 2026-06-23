import { Linking, View, StyleSheet } from "react-native";
import { AppCard } from "@/components/AppCard";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { spacing } from "@/constants/theme";
import { officialSources } from "@/data/officialSources";
import { legalTaxNotice, trustNotice } from "@/utils/copy";

export default function DisclaimerScreen() {
  return (
    <Screen>
      <SectionHeader title="About HudumaGuide TZ" subtitle="Huduma za Serikali na Biashara kwa urahisi." />
      <InfoBanner title="Independent guide" body={trustNotice} tone="warning" />
      <AppCard>
        <AppText variant="h3">Official government sources</AppText>
        <AppText muted>
          HudumaGuide TZ summarizes preparation steps only. Use these official sources for final requirements, fees, deadlines, forms, payments, and submissions.
        </AppText>
        <View style={styles.sourceList}>
          {officialSources.map((source) => (
            <View key={source.id} style={styles.sourceItem}>
              <AppText variant="small" style={styles.sourceTitle}>
                {source.name}
              </AppText>
              <AppText variant="tiny" muted>
                Covers: {source.covers.join(", ")}
              </AppText>
              <AppText variant="tiny" muted>
                {source.url}
              </AppText>
              <AppButton title="Open official source" icon="open-outline" variant="ghost" compact onPress={() => Linking.openURL(source.url)} />
            </View>
          ))}
        </View>
      </AppCard>
      <AppCard>
        <AppText variant="h3">What this app does</AppText>
        <AppText muted>
          HudumaGuide TZ helps users understand public-service and business-registration steps, prepare documents, save checklists, set reminders, and find official channels.
        </AppText>
      </AppCard>
      <AppCard>
        <AppText variant="h3">What this app does not do</AppText>
        <AppText muted>
          The app does not guarantee approval, does not submit official applications, does not set final government fees, and does not replace official instructions.
        </AppText>
      </AppCard>
      <InfoBanner title="Legal and tax" body={legalTaxNotice} tone="warning" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sourceList: {
    gap: spacing.md
  },
  sourceItem: {
    gap: spacing.xs
  },
  sourceTitle: {
    fontWeight: "800"
  }
});
