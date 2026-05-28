import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { legalTaxNotice, trustNotice } from "@/utils/copy";

export default function TermsScreen() {
  return (
    <Screen>
      <SectionHeader title="Terms of use" subtitle="Beta terms for HudumaGuide TZ" />
      <InfoBanner title="Trust notice" body={trustNotice} tone="warning" />
      <AppCard>
        <AppText variant="h3">Guidance only</AppText>
        <AppText muted>HudumaGuide TZ helps users understand and prepare for services. It does not submit official applications unless a verified official integration exists.</AppText>
      </AppCard>
      <AppCard>
        <AppText variant="h3">No guarantees</AppText>
        <AppText muted>We do not guarantee approval, processing time, or final fees for any public service or business process.</AppText>
      </AppCard>
      <AppCard>
        <AppText variant="h3">Legal and tax limits</AppText>
        <AppText muted>{legalTaxNotice} Confirm obligations with official sources or qualified professionals.</AppText>
      </AppCard>
      <AppCard>
        <AppText variant="h3">User responsibility</AppText>
        <AppText muted>Users are responsible for confirming final requirements, keeping their account secure, and checking official channels before payment or submission.</AppText>
      </AppCard>
    </Screen>
  );
}
