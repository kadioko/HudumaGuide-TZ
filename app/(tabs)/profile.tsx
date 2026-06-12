import { router } from "expo-router";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { Alert, Platform, Share } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { TextField } from "@/components/TextField";
import { isSupabaseConfigured } from "@/lib/supabase";
import { deleteAccountAndData, exportRemoteUserData } from "@/services/accountService";
import { clearLocalAnalyticsData, getLocalAnalyticsSummary, trackAnalyticsEvent } from "@/services/analyticsService";
import { getRuntimeIssueLog } from "@/services/runtimeLogger";
import { useAppStore } from "@/store/useAppStore";
import { trustNotice } from "@/utils/copy";

export default function ProfileScreen() {
  const language = useAppStore((state) => state.language);
  const userProfile = useAppStore((state) => state.userProfile);
  const syncStatus = useAppStore((state) => state.syncStatus);
  const syncError = useAppStore((state) => state.syncError);
  const syncQueue = useAppStore((state) => state.syncQueue);
  const lowDataMode = useAppStore((state) => state.lowDataMode);
  const securityPreferences = useAppStore((state) => state.securityPreferences);
  const offlineGuideCache = useAppStore((state) => state.offlineGuideCache);
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);
  const updateSecurityPreferences = useAppStore((state) => state.updateSecurityPreferences);
  const syncNow = useAppStore((state) => state.syncNow);
  const retryQueuedSync = useAppStore((state) => state.retryQueuedSync);
  const logout = useAppStore((state) => state.logout);
  const clearUserData = useAppStore((state) => state.clearUserData);
  const setLowDataMode = useAppStore((state) => state.setLowDataMode);
  const refreshOfflineGuideCache = useAppStore((state) => state.refreshOfflineGuideCache);
  const savedGuides = useAppStore((state) => state.savedGuideSlugs.length);
  const reminders = useAppStore((state) => state.reminders.length);
  const businessPlans = useAppStore((state) => state.businessPlans.length);
  const documents = useAppStore((state) => state.userDocuments.length);
  const localData = useAppStore((state) => ({
    language: state.language,
    savedGuideSlugs: state.savedGuideSlugs,
    checklistItemsByGuide: state.checklistItemsByGuide,
    reminders: state.reminders,
    userDocuments: state.userDocuments,
    businessPlans: state.businessPlans,
    feedbackReports: state.feedbackReports
  }));
  const [fullName, setFullName] = useState(userProfile?.fullName ?? "");
  const [region, setRegion] = useState(userProfile?.region ?? "");
  const [city, setCity] = useState(userProfile?.city ?? "");
  const [updateStatus, setUpdateStatus] = useState("Not checked");
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFullName(userProfile?.fullName ?? "");
      setRegion(userProfile?.region ?? "");
      setCity(userProfile?.city ?? "");
    }, 0);

    return () => clearTimeout(timer);
  }, [userProfile]);

  async function saveProfile() {
    if (!userProfile) {
      router.push("/auth");
      return;
    }

    await updateUserProfile({
      ...userProfile,
      fullName: fullName || undefined,
      region: region || undefined,
      city: city || undefined,
      preferredLanguage: language
    });
    if (region || city) {
      void trackAnalyticsEvent(
        "region_city_updated",
        { region: region || undefined, city: city || undefined, language },
        userProfile.id
      );
    }
  }

  async function exportData() {
    const analyticsSummary = await getLocalAnalyticsSummary();
    const privacyMetadata = {
      exportedAt: new Date().toISOString(),
      sync: {
        status: syncStatus,
        pendingQueueCount: syncQueue.length,
        queue: syncQueue,
        lastError: syncError,
        lastRemoteSyncAt: useAppStore.getState().lastRemoteSyncAt
      },
      analytics: analyticsSummary,
      runtimeIssues: getRuntimeIssueLog(),
      offlineGuideCache
    };
    const payload =
      userProfile && isSupabaseConfigured
        ? { ...(await exportRemoteUserData(userProfile.id, localData)), privacyMetadata }
        : { exportedAt: privacyMetadata.exportedAt, source: "HudumaGuide TZ", localData, privacyMetadata };

    await Share.share({
      message: JSON.stringify(payload, null, 2)
    });
  }

  function confirmDeleteAccount() {
    Alert.alert(
      "Delete account data",
      userProfile
        ? "This removes your Supabase account plus saved guides, checklists, reminders, document metadata, business plans, feedback reports, sync queue, and local analytics on this device. This cannot be undone."
        : "This clears saved guides, checklists, reminders, document metadata, business plans, feedback reports, sync queue, and local analytics on this device. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (userProfile && isSupabaseConfigured) {
                await deleteAccountAndData();
              }
              clearUserData();
              await clearLocalAnalyticsData();
              router.replace("/auth");
            } catch (error) {
              Alert.alert("Delete failed", error instanceof Error ? error.message : "Unable to delete account data.");
            }
          }
        }
      ]
    );
  }

  async function exportDiagnostics() {
    const analyticsSummary = await getLocalAnalyticsSummary();
    const state = useAppStore.getState();
    const updateInfo = await getUpdateInfo();
    await Share.share({
      message: JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          app: {
            version: Constants.expoConfig?.version,
            ...updateInfo
          },
          sync: {
            status: state.syncStatus,
            error: state.syncError,
            queueLength: state.syncQueue.length,
            lastRemoteSyncAt: state.lastRemoteSyncAt
          },
          storageCounts: {
            savedGuides: state.savedGuideSlugs.length,
            checklistGuides: Object.keys(state.checklistItemsByGuide).length,
            reminders: state.reminders.length,
            documents: state.userDocuments.length,
            documentFileRefs: state.userDocuments.filter((document) => Boolean(document.fileName)).length,
            businessPlans: state.businessPlans.length,
            feedbackReports: state.feedbackReports.length
          },
          featureFlags: {
            lowDataMode: state.lowDataMode,
            biometricLockEnabled: state.securityPreferences.biometricLockEnabled,
            supabaseConfigured: isSupabaseConfigured
          },
          analytics: analyticsSummary,
          runtimeIssues: getRuntimeIssueLog()
        },
        null,
        2
      )
    });
  }

  async function checkForUpdate() {
    setIsCheckingUpdate(true);
    try {
      if (Platform.OS === "web") {
        setUpdateStatus("Web updates are applied automatically after a Vercel deploy. Refresh the page to load the latest bundle.");
        return;
      }

      if (__DEV__) {
        setUpdateStatus("Native OTA updates are checked in production builds.");
        return;
      }

      const Updates = await import("expo-updates");
      const result = await Updates.checkForUpdateAsync();
      if (!result.isAvailable) {
        setUpdateStatus("No update available.");
        return;
      }

      setUpdateStatus("Update available. Downloading...");
      await Updates.fetchUpdateAsync();
      setUpdateStatus("Update ready. Restart the app to apply it.");
    } catch (error) {
      setUpdateStatus(error instanceof Error ? error.message : "Unable to check for updates.");
    } finally {
      setIsCheckingUpdate(false);
    }
  }

  async function clearAnalyticsOnly() {
    await clearLocalAnalyticsData();
    Alert.alert("Analytics cleared", "Local analytics history and pending analytics sync events were removed from this device.");
  }

  async function toggleBiometricLock() {
    if (Platform.OS === "web") {
      Alert.alert("App lock", "Biometric app lock is available in native Android/iOS builds.");
      return;
    }

    if (securityPreferences.biometricLockEnabled) {
      updateSecurityPreferences({ biometricLockEnabled: false });
      return;
    }

    const LocalAuthentication = await import("expo-local-authentication");
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !enrolled) {
      Alert.alert("Biometric lock", "No enrolled biometric or device authentication is available on this device.");
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Enable HudumaGuide TZ lock",
      fallbackLabel: "Use device passcode"
    });

    if (result.success) {
      updateSecurityPreferences({ biometricLockEnabled: true, lastUnlockedAt: new Date().toISOString() });
    }
  }

  return (
    <Screen>
      <SectionHeader title={language === "sw" ? "Profile & settings" : "Profile & settings"} subtitle="HudumaGuide TZ" />

      <InfoBanner
        title={userProfile ? "Account-backed beta" : "Local-only mode"}
        body={
          userProfile
            ? `Signed in${userProfile.email ? ` as ${userProfile.email}` : ""}. Sync status: ${syncStatus}.`
            : "Sign in to sync reminders, saved guides, document records, and business plans to Supabase."
        }
        tone={syncStatus === "error" ? "warning" : "info"}
      />
      {syncError ? <InfoBanner title="Sync issue" body={syncError} tone="warning" /> : null}

      <AppCard>
        <AppText variant="h3">Language</AppText>
        <LanguageToggle />
      </AppCard>

      <AppCard>
        <AppText variant="h3">Profile details</AppText>
        <TextField label="Full name" value={fullName} onChangeText={setFullName} placeholder="Optional" />
        <TextField label="Region" value={region} onChangeText={setRegion} placeholder="Dar es Salaam, Arusha..." />
        <TextField label="City / district" value={city} onChangeText={setCity} placeholder="Optional" />
        <AppButton title="Save profile" icon="save-outline" variant="secondary" onPress={saveProfile} />
      </AppCard>

      <AppCard>
        <AppText variant="h3">Your MVP data</AppText>
        <AppText muted>Saved guides: {savedGuides}</AppText>
        <AppText muted>Reminders: {reminders}</AppText>
        <AppText muted>Document records: {documents}</AppText>
        <AppText muted>Business plans: {businessPlans}</AppText>
        <AppText muted>Pending sync saves: {syncQueue.length}</AppText>
        <AppText muted>Offline guide cache: {offlineGuideCache?.guideCount ?? 0} guides</AppText>
        <AppButton title="Review sync queue" icon="git-compare-outline" variant="secondary" onPress={() => router.push("/sync-review" as never)} />
      </AppCard>

      <AppCard>
        <AppText variant="h3">Offline and low-data</AppText>
        <AppText muted>
          Saved guides and checklists stay available on this device. Document metadata is available offline; files depend on Storage sync.
        </AppText>
        <AppButton
          title={lowDataMode ? "Low-data mode on" : "Low-data mode off"}
          icon="cellular-outline"
          variant={lowDataMode ? "primary" : "secondary"}
          onPress={() => setLowDataMode(!lowDataMode)}
        />
        <AppButton title="Refresh offline guide cache" icon="download-outline" variant="secondary" onPress={refreshOfflineGuideCache} />
        {syncQueue.length ? <AppButton title="Retry pending sync" icon="refresh-outline" onPress={retryQueuedSync} /> : null}
      </AppCard>

      <AppCard>
        <AppText variant="h3">Beta updates</AppText>
        <AppText muted>Runtime: {getRuntimeLabel()}</AppText>
        <AppText muted>Channel: {Platform.OS === "web" ? "web" : "native"}; update: {Platform.OS === "web" ? "Vercel bundle" : "native bundle"}</AppText>
        <AppText muted>{updateStatus}</AppText>
        <AppButton title="Check for update" icon="cloud-download-outline" variant="secondary" loading={isCheckingUpdate} onPress={checkForUpdate} />
        <AppButton title={Platform.OS === "web" ? "Refresh page" : "Restart to apply update"} icon="refresh-circle-outline" variant="secondary" onPress={() => void reloadApp()} />
      </AppCard>

      <AppCard>
        <AppText variant="h3">Privacy</AppText>
        <AppText muted>
          HudumaGuide TZ syncs your saved guides, checklist progress, reminders, document metadata, and business plans only after sign in. It does not track uploaded document contents for analytics.
        </AppText>
      </AppCard>

      <AppCard>
        <AppText variant="h3">App lock</AppText>
        <AppText muted>Optional beta safeguard for opening sensitive app areas on this device. This uses device biometrics/passcode where available.</AppText>
        <AppButton
          title={securityPreferences.biometricLockEnabled ? "Biometric lock on" : "Enable biometric lock"}
          icon="finger-print-outline"
          variant={securityPreferences.biometricLockEnabled ? "primary" : "secondary"}
          onPress={toggleBiometricLock}
        />
      </AppCard>

      {userProfile ? (
        <>
          <AppButton title="Sync now" icon="cloud-upload-outline" variant="secondary" onPress={syncNow} />
          <AppButton title="Sign out" icon="log-out-outline" variant="secondary" onPress={logout} />
        </>
      ) : (
        <AppButton title="Account / login" icon="person-circle-outline" variant="secondary" onPress={() => router.push("/auth")} />
      )}
      <AppButton title="Export my data" icon="download-outline" variant="secondary" onPress={exportData} />
      <AppButton title="Export beta diagnostics" icon="bug-outline" variant="secondary" onPress={exportDiagnostics} />
      <AppButton title="Beta readiness checklist" icon="clipboard-outline" variant="secondary" onPress={() => router.push("/beta-readiness" as never)} />
      <AppButton title="Support & safety" icon="help-circle-outline" variant="secondary" onPress={() => router.push("/support" as never)} />
      <AppButton title="Clear local analytics" icon="analytics-outline" variant="secondary" onPress={clearAnalyticsOnly} />
      <AppButton title="Admin content console" icon="shield-checkmark-outline" variant="secondary" onPress={() => router.push("/admin/index")} />
      <AppButton title={userProfile ? "Delete account" : "Clear local data"} icon="trash-outline" variant="danger" onPress={confirmDeleteAccount} />
      <AppButton title="About & disclaimer" icon="information-circle-outline" variant="secondary" onPress={() => router.push("/disclaimer")} />
      <AppButton title="Privacy policy" icon="lock-closed-outline" variant="secondary" onPress={() => router.push("/privacy")} />
      <AppButton title="Terms of use" icon="document-text-outline" variant="secondary" onPress={() => router.push("/terms")} />
      <InfoBanner title="Trust notice" body={trustNotice} tone="warning" />
    </Screen>
  );
}

async function reloadApp() {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.location.reload();
    return;
  }

  const Updates = await import("expo-updates");
  await Updates.reloadAsync();
}

async function getUpdateInfo() {
  if (Platform.OS === "web") {
    return {
      runtimeVersion: getRuntimeLabel(),
      updateChannel: "web",
      updateId: "vercel-static-bundle",
      isEmbeddedLaunch: true
    };
  }

  const Updates = await import("expo-updates");
  return {
    runtimeVersion: Updates.runtimeVersion ?? getRuntimeLabel(),
    updateChannel: Updates.channel ?? "embedded",
    updateId: Updates.updateId,
    isEmbeddedLaunch: Updates.isEmbeddedLaunch
  };
}

function getRuntimeLabel() {
  const runtimeVersion = Constants.expoConfig?.runtimeVersion;
  if (typeof runtimeVersion === "string") {
    return runtimeVersion;
  }

  if (runtimeVersion && typeof runtimeVersion === "object" && "policy" in runtimeVersion) {
    return String(runtimeVersion.policy);
  }

  return Constants.expoConfig?.version ?? "appVersion";
}

