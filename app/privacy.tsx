import { router } from "expo-router";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";

export default function PrivacyScreen() {
  return (
    <Screen>
      <SectionHeader title="Privacy policy" subtitle="HudumaGuide TZ beta privacy position" />
      <InfoBanner
        title="Independent guide"
        body="HudumaGuide TZ is not an official government platform. It helps users organize guidance, reminders, and documents."
        tone="warning"
      />
      <AppCard>
        <AppText variant="h3">What we store</AppText>
        <AppText muted>When you sign in, we sync saved guides, checklist progress, reminders, document metadata, business plans, profile language, and optional region/city.</AppText>
      </AppCard>
      <AppCard>
        <AppText variant="h3">Document privacy</AppText>
        <AppText muted>Document files are stored in private Supabase Storage paths owned by your user account. Analytics must never include uploaded document contents or private notes.</AppText>
      </AppCard>
      <AppCard>
        <AppText variant="h3">Analytics</AppText>
        <AppText muted>We track aggregated product events such as searches, saved guides, reminder categories, wizard completion, and reported outdated guides. We do not sell sensitive user data.</AppText>
      </AppCard>
      <AppCard>
        <AppText variant="h3">Your controls</AppText>
        <AppText muted>You can export your app data or request account deletion from Profile. Account deletion removes user-owned app rows through Supabase cascading deletes.</AppText>
        <AppButton title="Delete account instructions" icon="trash-outline" variant="secondary" onPress={() => router.push("/account-deletion" as never)} />
      </AppCard>
    </Screen>
  );
}
