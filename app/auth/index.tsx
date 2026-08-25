import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { createRouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { colors, spacing } from "@/constants/theme";
import { isSupabaseConfigured } from "@/lib/supabase";
import { ensureProfile, signInWithPassword, signUpWithPassword } from "@/services/accountService";
import { useAppStore } from "@/store/useAppStore";

const schema = z.object({
  fullName: z.string().optional(),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Use at least 6 characters")
});

type FormValues = z.infer<typeof schema>;

export const ErrorBoundary = createRouteErrorBoundary("Account screen could not load");

export default function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [authError, setAuthError] = useState<string | undefined>();
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const refreshRemoteData = useAppStore((state) => state.refreshRemoteData);
  const isSwahili = language === "sw";
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "" }
  });

  async function onSubmit(values: FormValues) {
    setAuthError(undefined);
    if (!isSupabaseConfigured) {
      router.replace("/(tabs)/home");
      return;
    }

    try {
      const session = mode === "signin"
        ? await signInWithPassword(values.email, values.password)
        : await signUpWithPassword(values.email, values.password, values.fullName);

      if (!session?.user) {
        setAuthError(isSwahili ? "Angalia email yako kuthibitisha akaunti, kisha ingia." : "Check your email to confirm your account, then sign in.");
        return;
      }

      const profile = await ensureProfile(session.user.id, session.user.email, language);
      setUserProfile(profile);
      await refreshRemoteData();
      router.replace("/(tabs)/home");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : (isSwahili ? "Imeshindikana kuendelea. Jaribu tena." : "Unable to continue. Please try again."));
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.icon}><AppText color={colors.surface} variant="h3">TZ</AppText></View>
          <View style={styles.copy}>
            <AppText variant="h1">{mode === "signin" ? (isSwahili ? "Karibu tena" : "Welcome back") : (isSwahili ? "Unda akaunti" : "Create your account")}</AppText>
            <AppText muted>{isSwahili ? "Akaunti ni hiari, lakini inasaidia kusync maendeleo yako." : "An account is optional, but keeps your progress in sync."}</AppText>
          </View>
        </View>
        <View style={styles.languageRow}>
          <AppButton title="Kiswahili" variant={language === "sw" ? "primary" : "secondary"} onPress={() => setLanguage("sw")} style={styles.languageButton} />
          <AppButton title="English" variant={language === "en" ? "primary" : "secondary"} onPress={() => setLanguage("en")} style={styles.languageButton} />
        </View>
      </View>

      <InfoBanner
        title={isSwahili ? "Nini kinasync?" : "What syncs?"}
        body={isSupabaseConfigured
          ? (isSwahili ? "Checklist, reminders, metadata za nyaraka na mipango ya biashara. Maudhui ya file zako hayatumiki kwa analytics." : "Checklists, reminders, document metadata, and business plans. Your uploaded file contents are not used for analytics.")
          : (isSwahili ? "Build hii inaendelea kwenye kifaa chako hadi akaunti ya Supabase itakapounganishwa." : "This build continues on your device until a Supabase account is connected.")}
      />

      <AppCard>
        {mode === "signup" ? (
          <Controller control={control} name="fullName" render={({ field: { onChange, value } }) => (
            <TextField label={isSwahili ? "Jina kamili (hiari)" : "Full name (optional)"} value={value} onChangeText={onChange} autoCapitalize="words" />
          )} />
        ) : null}
        <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
          <TextField label="Email" value={value} onChangeText={onChange} autoCapitalize="none" keyboardType="email-address" error={errors.email?.message} />
        )} />
        <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
          <TextField label={isSwahili ? "Nenosiri" : "Password"} value={value} onChangeText={onChange} secureTextEntry error={errors.password?.message} />
        )} />
        {authError ? <InfoBanner title={isSwahili ? "Tatizo la akaunti" : "Account issue"} body={authError} tone="warning" /> : null}
        <AppButton title={mode === "signin" ? (isSwahili ? "Ingia" : "Sign in") : (isSwahili ? "Unda akaunti" : "Create account")} icon={mode === "signin" ? "log-in-outline" : "person-add-outline"} loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
        <AppButton title={mode === "signin" ? (isSwahili ? "Huna akaunti? Jisajili" : "Need an account? Sign up") : (isSwahili ? "Tayari una akaunti? Ingia" : "Already have an account? Sign in")} variant="ghost" onPress={() => { setAuthError(undefined); setMode(mode === "signin" ? "signup" : "signin"); }} />
      </AppCard>

      <AppCard muted>
        <AppText variant="h3">{isSwahili ? "Tumia bila akaunti" : "Use without an account"}</AppText>
        <AppText muted>{isSwahili ? "Unaweza kutafuta guide, kuanza roadmap na kuhifadhi data kwenye kifaa hiki. Ingia baadaye kwa sync." : "You can search guides, start a roadmap, and save on this device. Sign in later when you want sync."}</AppText>
        <AppButton title={isSwahili ? "Endelea bila akaunti" : "Continue without an account"} icon="arrow-forward-outline" variant="secondary" onPress={() => router.replace("/(tabs)/home")} />
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.md },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  icon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.green, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, gap: spacing.xs },
  languageRow: { flexDirection: "row", gap: spacing.sm },
  languageButton: { flex: 1, minHeight: 42 }
});
