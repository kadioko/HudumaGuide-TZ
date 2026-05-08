import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
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

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Use at least 6 characters")
});

type FormValues = z.infer<typeof schema>;

export default function AuthScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });

  function onSubmit() {
    router.replace("/(tabs)/home");
  }

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="h1">Account</AppText>
        <AppText muted>
          Supabase Auth is prepared. For this MVP, you can continue after validation while keys are not configured.
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
        <AppButton title="Continue" icon="log-in-outline" onPress={handleSubmit(onSubmit)} />
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm
  }
});
