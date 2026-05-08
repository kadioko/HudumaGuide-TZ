import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { legalTaxNotice, trustNotice } from "@/utils/copy";

export default function DisclaimerScreen() {
  return (
    <Screen>
      <SectionHeader title="About HudumaGuide TZ" subtitle="Huduma za Serikali na Biashara kwa urahisi." />
      <InfoBanner title="Independent guide" body={trustNotice} tone="warning" />
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
