import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";

export default function AccountDeletionScreen() {
  return (
    <Screen>
      <SectionHeader title="Delete account and data" subtitle="HudumaGuide TZ account deletion request" />
      <InfoBanner
        title="Independent guide"
        body="HudumaGuide TZ is not an official government platform. This page explains how to delete your HudumaGuide TZ account data."
        tone="warning"
      />

      <AppCard>
        <AppText variant="h3">Delete from inside the app</AppText>
        <AppText muted>
          Open HudumaGuide TZ, go to Profile, then choose Delete account. If you are signed in, this removes your Supabase account and user-owned app data.
        </AppText>
      </AppCard>

      <AppCard>
        <AppText variant="h3">Request deletion by support</AppText>
        <AppText muted>
          If you cannot access the app, open Support & safety in the app and choose privacy as the request type. Include the email address used for your HudumaGuide TZ account. Do not send passwords, document contents, NIDA numbers, TINs, or private files.
        </AppText>
      </AppCard>

      <AppCard>
        <AppText variant="h3">Data deleted</AppText>
        <AppText muted>
          Account deletion removes saved guides, checklist progress, reminders, document metadata, business plans, feedback reports, sync queue data, and local analytics associated with your account. Private uploaded document files are queued for storage cleanup.
        </AppText>
      </AppCard>

      <AppCard>
        <AppText variant="h3">Data retained</AppText>
        <AppText muted>
          We may retain minimal operational records required for security, abuse prevention, legal compliance, or backup recovery for a limited period. We do not sell user data.
        </AppText>
      </AppCard>
    </Screen>
  );
}
