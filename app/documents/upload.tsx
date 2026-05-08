import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";

export default function UploadDocumentScreen() {
  return (
    <Screen>
      <SectionHeader title="Upload document" subtitle="Secure document upload is prepared for the next MVP slice." />
      <InfoBanner
        title="Security note"
        body="Document files should require login, Supabase Storage, private buckets, row-level security metadata, and a clear privacy notice before launch."
        tone="warning"
      />
      <AppCard>
        <AppText variant="h3">Coming next</AppText>
        <AppText muted>
          This screen is intentionally a placeholder so the first release can focus on searchable guides, checklists, business setup, and reminders.
        </AppText>
        <AppButton title="Supabase Storage ready later" icon="lock-closed-outline" variant="secondary" onPress={() => undefined} />
      </AppCard>
    </Screen>
  );
}
