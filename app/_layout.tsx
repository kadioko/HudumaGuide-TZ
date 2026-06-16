import "react-native-gesture-handler";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { colors } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { shouldShowAppLock } from "@/utils/security";

export default function RootLayout() {
  const segments = useSegments();
  const isHydrated = useAppStore((state) => state.isHydrated);
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
  const securityPreferences = useAppStore((state) => state.securityPreferences);

  useEffect(() => {
    const currentRoot = segments[0];
    if (
      isHydrated &&
      hasCompletedOnboarding &&
      currentRoot !== "security-lock" &&
      shouldShowAppLock(securityPreferences.biometricLockEnabled, securityPreferences.lastUnlockedAt)
    ) {
      router.replace("/security-lock");
    }
  }, [hasCompletedOnboarding, isHydrated, securityPreferences.biometricLockEnabled, securityPreferences.lastUnlockedAt, segments]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "800" },
          contentStyle: { backgroundColor: colors.background }
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/index" options={{ title: "Account" }} />
        <Stack.Screen name="security-lock" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="services/[slug]/index" options={{ title: "Service Guide" }} />
        <Stack.Screen name="services/[slug]/checklist" options={{ title: "Checklist" }} />
        <Stack.Screen name="checklists" options={{ title: "Saved Checklists" }} />
        <Stack.Screen name="msaidizi" options={{ title: "Msaidizi" }} />
        <Stack.Screen name="sync-review" options={{ title: "Sync Review" }} />
        <Stack.Screen name="account-deletion" options={{ title: "Delete Account" }} />
        <Stack.Screen name="beta-readiness" options={{ title: "Beta Readiness" }} />
        <Stack.Screen name="admin/index" options={{ title: "Admin Console" }} />
        <Stack.Screen name="admin/categories" options={{ title: "Service Categories" }} />
        <Stack.Screen name="admin/guides" options={{ title: "Service Guides" }} />
        <Stack.Screen name="admin/reports" options={{ title: "Review Queue" }} />
        <Stack.Screen name="admin/analytics" options={{ title: "Analytics" }} />
        <Stack.Screen name="admin/versions" options={{ title: "Content Versions" }} />
        <Stack.Screen name="admin/storage-cleanup" options={{ title: "Storage Cleanup" }} />
        <Stack.Screen name="biashara/wizard" options={{ title: "BiasharaStart" }} />
        <Stack.Screen name="biashara/roadmap" options={{ title: "Business Roadmap" }} />
        <Stack.Screen name="biashara/profile" options={{ title: "Business Profile" }} />
        <Stack.Screen name="reminders/create" options={{ title: "Create Reminder" }} />
        <Stack.Screen name="notifications/settings" options={{ title: "Notification Settings" }} />
        <Stack.Screen name="documents/upload" options={{ title: "Upload Document" }} />
        <Stack.Screen name="disclaimer" options={{ title: "About & Disclaimer" }} />
        <Stack.Screen name="privacy" options={{ title: "Privacy Policy" }} />
        <Stack.Screen name="terms" options={{ title: "Terms" }} />
        <Stack.Screen name="feedback" options={{ title: "Report Outdated Info" }} />
        <Stack.Screen name="support" options={{ title: "Support & Safety" }} />
      </Stack>
    </>
  );
}
