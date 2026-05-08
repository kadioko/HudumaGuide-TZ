import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.background} />
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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="services/[slug]/index" options={{ title: "Service Guide" }} />
        <Stack.Screen name="services/[slug]/checklist" options={{ title: "Checklist" }} />
        <Stack.Screen name="checklists" options={{ title: "Saved Checklists" }} />
        <Stack.Screen name="biashara/wizard" options={{ title: "BiasharaStart" }} />
        <Stack.Screen name="biashara/roadmap" options={{ title: "Business Roadmap" }} />
        <Stack.Screen name="biashara/profile" options={{ title: "Business Profile" }} />
        <Stack.Screen name="reminders/create" options={{ title: "Create Reminder" }} />
        <Stack.Screen name="documents/upload" options={{ title: "Upload Document" }} />
        <Stack.Screen name="disclaimer" options={{ title: "About & Disclaimer" }} />
        <Stack.Screen name="feedback" options={{ title: "Report Outdated Info" }} />
      </Stack>
    </>
  );
}
