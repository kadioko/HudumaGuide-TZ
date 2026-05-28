import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { z } from "zod";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { spacing } from "@/constants/theme";
import { isSupabaseConfigured } from "@/lib/supabase";
import { ensureProfile, signInWithPassword, signUpWithPassword } from "@/services/accountService";
import { useAppStore } from "@/store/useAppStore";

const schema = z.object({
  fullName: z.string().optional(),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Use at least 6 characters")
});

type FormValues = z.infer<typeof schema>;

export default function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [authError, setAuthError] = useState<string | undefined>();
  const language = useAppStore((state) => state.language);
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const refreshRemoteData = useAppStore((state) => state.refreshRemoteData);
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
      const session =
        mode === "signin"
          ? await signInWithPassword(values.email, values.password)
          : await signUpWithPassword(values.email, values.password, values.fullName);

      if (!session?.user) {
        setAuthError("Check your email to confirm your account, then sign in.");
        return;
      }

      const profile = await ensureProfile(session.user.id, session.user.email, language);
      setUserProfile(profile);
      await refreshRemoteData();
      router.replace("/(tabs)/home");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to continue. Please try again.");
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="h1">{mode === "signin" ? "Sign in" : "Create account"}</AppText>
        <AppText muted>
          {isSupabaseConfigured
            ? "Use your HudumaGuide TZ account to sync reminders, checklists, documents, and business plans."
            : "Supabase keys are not configured, so this build will continue in local-only mode."}
        </AppText>
      </View>

      <InfoBanner
        title={isSupabaseConfigured ? "Supabase connected" : "Mock auth mode"}
        body={
          isSupabaseConfigured
            ? "The Supabase client has environment variables configured."
            : "Add Supabase environment variables when you are ready for real sign in."
        }
      />

      <AppCard>
        {mode === "signup" ? (
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value } }) => (
              <TextField label="Full name" value={value} onChangeText={onChange} autoCapitalize="words" />
            )}
          />
        ) : null}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextField label="Email" value={value} onChangeText={onChange} autoCapitalize="none" keyboardType="email-address" error={errors.email?.message} />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextField label="Password" value={value} onChangeText={onChange} secureTextEntry error={errors.password?.message} />
          )}
        />
        {authError ? <InfoBanner title="Account error" body={authError} tone="warning" /> : null}
        <AppButton
          title={mode === "signin" ? "Sign in" : "Create account"}
          icon={mode === "signin" ? "log-in-outline" : "person-add-outline"}
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />
        <AppButton
          title={mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          variant="ghost"
          onPress={() => {
            setAuthError(undefined);
            setMode(mode === "signin" ? "signup" : "signin");
          }}
        />
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm
  }
});
