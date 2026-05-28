import { router } from "expo-router";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAppStore } from "@/store/useAppStore";

export default function AdminIndexScreen() {
  const profile = useAppStore((state) => state.userProfile);
  const isAdmin = profile?.email?.includes("admin") || false;

  return (
    <Screen>
      <SectionHeader title="Admin content console" subtitle="Service guide publishing, review, and content quality workflows." />
      <InfoBanner
        title={isSupabaseConfigured ? "Supabase admin mode" : "Local planning mode"}
        body={
          isSupabaseConfigured
            ? "Admin writes require an authenticated profile with role=admin in Supabase RLS."
            : "Supabase is not configured, so these screens show the management workflow without writing remote data."
        }
        tone="warning"
      />
      {!isAdmin ? (
        <InfoBanner
          title="Admin access required"
          body="This MVP surfaces the console for setup, but Supabase RLS must enforce role=admin before production use."
          tone="warning"
        />
      ) : null}

      <AppCard>
        <AppText variant="h3">Content operations</AppText>
        <AppText muted>
          Manage categories, guides, official-source references, verification status, review expiry, and outdated-info reports.
        </AppText>
      </AppCard>

      <AppButton title="Manage categories" icon="albums-outline" onPress={() => router.push("/admin/categories")} />
      <AppButton title="Manage service guides" icon="document-text-outline" variant="secondary" onPress={() => router.push("/admin/guides")} />
      <AppButton title="Review outdated reports" icon="flag-outline" variant="secondary" onPress={() => router.push("/admin/reports")} />
      <AppButton title="Analytics dashboard" icon="analytics-outline" variant="secondary" onPress={() => router.push("/admin/analytics")} />
      <AppButton title="Content versions" icon="git-branch-outline" variant="secondary" onPress={() => router.push("/admin/versions")} />
      <AppButton title="Storage cleanup" icon="shield-checkmark-outline" variant="secondary" onPress={() => router.push("/admin/storage-cleanup")} />
    </Screen>
  );
}
