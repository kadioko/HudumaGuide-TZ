import "react-native-gesture-handler";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { createRouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { screenTitle } from "@/constants/screenTitles";
import { colors } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { shouldShowAppLock } from "@/utils/security";

export const ErrorBoundary = createRouteErrorBoundary("Something went wrong");

export default function RootLayout() {
  const segments = useSegments();
  const isHydrated = useAppStore((state) => state.isHydrated);
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
  const securityPreferences = useAppStore((state) => state.securityPreferences);
  const language = useAppStore((state) => state.language);

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
        <Stack.Screen name="auth/index" options={{ title: screenTitle("auth/index", language) }} />
        <Stack.Screen name="security-lock" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="services/[slug]/index" options={{ title: screenTitle("services/[slug]/index", language) }} />
        <Stack.Screen name="services/[slug]/checklist" options={{ title: screenTitle("services/[slug]/checklist", language) }} />
        <Stack.Screen name="checklists" options={{ title: screenTitle("checklists", language) }} />
        <Stack.Screen name="msaidizi" options={{ title: screenTitle("msaidizi", language) }} />
        <Stack.Screen name="sync-review" options={{ title: screenTitle("sync-review", language) }} />
        <Stack.Screen name="account-deletion" options={{ title: screenTitle("account-deletion", language) }} />
        <Stack.Screen name="beta-readiness" options={{ title: screenTitle("beta-readiness", language) }} />
        <Stack.Screen name="admin/index" options={{ title: screenTitle("admin/index", language) }} />
        <Stack.Screen name="admin/categories" options={{ title: screenTitle("admin/categories", language) }} />
        <Stack.Screen name="admin/guides" options={{ title: screenTitle("admin/guides", language) }} />
        <Stack.Screen name="admin/reports" options={{ title: screenTitle("admin/reports", language) }} />
        <Stack.Screen name="admin/analytics" options={{ title: screenTitle("admin/analytics", language) }} />
        <Stack.Screen name="admin/versions" options={{ title: screenTitle("admin/versions", language) }} />
        <Stack.Screen name="admin/storage-cleanup" options={{ title: screenTitle("admin/storage-cleanup", language) }} />
        <Stack.Screen name="biashara/wizard" options={{ title: screenTitle("biashara/wizard", language) }} />
        <Stack.Screen name="biashara/roadmap" options={{ title: screenTitle("biashara/roadmap", language) }} />
        <Stack.Screen name="biashara/profile" options={{ title: screenTitle("biashara/profile", language) }} />
        <Stack.Screen name="reminders/create" options={{ title: screenTitle("reminders/create", language) }} />
        <Stack.Screen name="notifications/settings" options={{ title: screenTitle("notifications/settings", language) }} />
        <Stack.Screen name="documents/upload" options={{ title: screenTitle("documents/upload", language) }} />
        <Stack.Screen name="disclaimer" options={{ title: screenTitle("disclaimer", language) }} />
        <Stack.Screen name="privacy" options={{ title: screenTitle("privacy", language) }} />
        <Stack.Screen name="terms" options={{ title: screenTitle("terms", language) }} />
        <Stack.Screen name="feedback" options={{ title: screenTitle("feedback", language) }} />
        <Stack.Screen name="support" options={{ title: screenTitle("support", language) }} />
      </Stack>
    </>
  );
}
