import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";

export default function SecurityLockScreen() {
  const [checking, setChecking] = useState(false);
  const updateSecurityPreferences = useAppStore((state) => state.updateSecurityPreferences);

  const unlock = useCallback(async () => {
    setChecking(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !enrolled) {
        Alert.alert("App lock", "Device authentication is not available. App lock has been turned off for this device.");
        updateSecurityPreferences({ biometricLockEnabled: false });
        router.replace("/(tabs)/home");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock HudumaGuide TZ",
        fallbackLabel: "Use device passcode",
        cancelLabel: "Cancel"
      });

      if (result.success) {
        updateSecurityPreferences({ biometricLockEnabled: true, lastUnlockedAt: new Date().toISOString() });
        router.replace("/(tabs)/home");
      }
    } finally {
      setChecking(false);
    }
  }, [updateSecurityPreferences]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void unlock();
    }, 0);

    return () => clearTimeout(timer);
  }, [unlock]);

  return (
    <Screen>
      <View style={styles.wrap}>
        <AppCard style={styles.card}>
          <View style={styles.mark}>
            <AppText variant="title" color={colors.surface}>HG</AppText>
          </View>
          <AppText variant="title">HudumaGuide TZ</AppText>
          <AppText muted style={styles.center}>
            Unlock to open saved documents, reminders, checklists, and business plans on this device.
          </AppText>
          <AppButton title={checking ? "Checking" : "Unlock"} icon="lock-open-outline" onPress={unlock} />
        </AppCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center"
  },
  card: {
    alignItems: "center"
  },
  mark: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm
  },
  center: {
    textAlign: "center"
  }
});
