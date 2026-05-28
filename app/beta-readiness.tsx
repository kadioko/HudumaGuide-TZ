import { StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { spacing } from "@/constants/theme";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAppStore } from "@/store/useAppStore";

type ReadinessItem = {
  title: string;
  status: "ready" | "needs_live" | "blocked";
  detail: string;
};

export default function BetaReadinessScreen() {
  const userProfile = useAppStore((state) => state.userProfile);
  const syncStatus = useAppStore((state) => state.syncStatus);
  const syncQueue = useAppStore((state) => state.syncQueue);
  const offlineGuideCache = useAppStore((state) => state.offlineGuideCache);
  const lowDataMode = useAppStore((state) => state.lowDataMode);
  const securityPreferences = useAppStore((state) => state.securityPreferences);
  const refreshOfflineGuideCache = useAppStore((state) => state.refreshOfflineGuideCache);
  const syncNow = useAppStore((state) => state.syncNow);

  const items: ReadinessItem[] = [
    {
      title: "Supabase configuration",
      status: isSupabaseConfigured ? "ready" : "blocked",
      detail: isSupabaseConfigured ? "Public URL and anon key are configured." : "Add Expo public Supabase environment variables."
    },
    {
      title: "Signed-in beta account",
      status: userProfile ? "ready" : "needs_live",
      detail: userProfile ? `Signed in${userProfile.email ? ` as ${userProfile.email}` : ""}.` : "Sign in with a beta user to test account-backed data."
    },
    {
      title: "User data sync",
      status: syncStatus === "synced" && syncQueue.length === 0 ? "ready" : "needs_live",
      detail: `Status: ${syncStatus}. Pending saves: ${syncQueue.length}.`
    },
    {
      title: "Offline guide cache",
      status: (offlineGuideCache?.guideCount ?? 0) > 0 ? "ready" : "needs_live",
      detail: `${offlineGuideCache?.guideCount ?? 0} guides cached. Low-data mode: ${lowDataMode ? "on" : "off"}.`
    },
    {
      title: "Document Storage",
      status: "needs_live",
      detail: "Validate upload, preview/download, replace, delete, camera capture, and cross-user denial on a real project."
    },
    {
      title: "Notifications",
      status: "needs_live",
      detail: "Validate delivery, repeats, pre-deadline alerts, and quiet hours on a physical Android device."
    },
    {
      title: "Content review",
      status: "blocked",
      detail: "Official links and seeded guide content need Tanzanian reviewer/source checks before public launch."
    },
    {
      title: "App lock",
      status: securityPreferences.biometricLockEnabled ? "ready" : "needs_live",
      detail: securityPreferences.biometricLockEnabled ? "Device app lock is enabled." : "Enable and test biometric/passcode lock on device."
    }
  ];

  return (
    <Screen>
      <SectionHeader title="Beta readiness" subtitle="Quick local checklist before a real Tanzanian user test." />
      <InfoBanner
        title="What this screen means"
        body="Ready means the app can see the local setup. Needs live means it must be tested against Supabase or a physical Android device. Blocked means external review or fresh credentials are required."
        tone="warning"
      />
      <View style={styles.actions}>
        <AppButton title="Sync now" icon="cloud-upload-outline" variant="secondary" onPress={syncNow} style={styles.action} />
        <AppButton title="Refresh cache" icon="download-outline" variant="secondary" onPress={refreshOfflineGuideCache} style={styles.action} />
      </View>

      {items.map((item) => (
        <AppCard key={item.title}>
          <View style={styles.row}>
            <View style={styles.copy}>
              <AppText variant="h3">{item.title}</AppText>
              <AppText muted>{item.detail}</AppText>
            </View>
            <Pill label={statusLabel(item.status)} active={item.status === "ready"} />
          </View>
        </AppCard>
      ))}
    </Screen>
  );
}

function statusLabel(status: ReadinessItem["status"]) {
  switch (status) {
    case "ready":
      return "ready";
    case "needs_live":
      return "needs live test";
    case "blocked":
      return "blocked";
  }
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  action: {
    flex: 1
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md
  },
  copy: {
    flex: 1,
    gap: spacing.xs
  }
});
