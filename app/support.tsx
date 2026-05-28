import { zodResolver } from "@hookform/resolvers/zod";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Share, StyleSheet, View } from "react-native";
import { z } from "zod";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { TextField } from "@/components/TextField";
import { spacing } from "@/constants/theme";
import { trackAnalyticsEvent } from "@/services/analyticsService";
import { useAppStore } from "@/store/useAppStore";

const supportCategories = ["support", "privacy", "bug", "safety"] as const;

const schema = z.object({
  message: z.string().min(8, "Please describe what you need help with")
});

type SupportCategory = (typeof supportCategories)[number];
type FormValues = z.infer<typeof schema>;

export default function SupportScreen() {
  const language = useAppStore((state) => state.language);
  const userProfile = useAppStore((state) => state.userProfile);
  const addFeedbackReport = useAppStore((state) => state.addFeedbackReport);
  const syncStatus = useAppStore((state) => state.syncStatus);
  const syncQueue = useAppStore((state) => state.syncQueue);
  const savedGuideCount = useAppStore((state) => state.savedGuideSlugs.length);
  const reminderCount = useAppStore((state) => state.reminders.length);
  const documentCount = useAppStore((state) => state.userDocuments.length);
  const businessPlanCount = useAppStore((state) => state.businessPlans.length);
  const [category, setCategory] = useState<SupportCategory>("support");
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { message: "" }
  });

  function onSubmit(values: FormValues) {
    addFeedbackReport({
      id: `support-${Date.now()}`,
      category,
      message: values.message,
      createdAt: new Date().toISOString()
    });
    void trackAnalyticsEvent("support_request_submitted", { supportCategory: category, language }, userProfile?.id);
    reset();
    Alert.alert("Support request saved", "This beta request is saved locally and will sync to the review queue when connected.");
  }

  async function shareDiagnostics() {
    await Share.share({
      message: [
        "HudumaGuide TZ beta diagnostics",
        `Signed in: ${Boolean(userProfile)}`,
        `Sync status: ${syncStatus}`,
        `Pending sync saves: ${syncQueue.length}`,
        `Saved guides: ${savedGuideCount}`,
        `Reminders: ${reminderCount}`,
        `Document records: ${documentCount}`,
        `Business plans: ${businessPlanCount}`,
        "",
        "Do not include document contents, passwords, NIDA numbers, TINs, or private notes when sharing diagnostics."
      ].join("\n")
    });
  }

  async function openEmailDraft() {
    const subject = encodeURIComponent("HudumaGuide TZ beta support");
    const body = encodeURIComponent("Describe the issue. Do not include passwords, document contents, or sensitive IDs.");
    const url = `mailto:?subject=${subject}&body=${body}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert("Email not available", "Use the in-app support request form instead.");
      return;
    }

    await Linking.openURL(url);
  }

  return (
    <Screen>
      <SectionHeader title="Support & safety" subtitle="Beta help, privacy requests, and issue reporting." />
      <InfoBanner
        title="Independent guide"
        body="HudumaGuide TZ is not an official emergency, legal, tax, or government support channel. For urgent or official matters, contact the relevant authority directly."
        tone="warning"
      />

      <AppCard>
        <AppText variant="h3">Request type</AppText>
        <View style={styles.row}>
          {supportCategories.map((item) => (
            <Pill key={item} label={item} active={category === item} onPress={() => setCategory(item)} />
          ))}
        </View>
        <Controller
          control={control}
          name="message"
          render={({ field: { onChange, value } }) => (
            <TextField
              label="How can we help?"
              value={value}
              onChangeText={onChange}
              multiline
              error={errors.message?.message}
              placeholder="Example: I cannot preview a document file, or this guide looks wrong..."
            />
          )}
        />
        <AppButton title="Save support request" icon="send-outline" onPress={handleSubmit(onSubmit)} />
      </AppCard>

      <AppCard>
        <AppText variant="h3">Quick actions</AppText>
        <AppButton title="Report outdated guide info" icon="flag-outline" variant="secondary" onPress={() => router.push("/feedback")} />
        <AppButton title="Share beta diagnostics" icon="share-social-outline" variant="secondary" onPress={shareDiagnostics} />
        <AppButton title="Open email draft" icon="mail-outline" variant="secondary" onPress={openEmailDraft} />
      </AppCard>

      <AppCard>
        <AppText variant="h3">What not to send</AppText>
        <AppText muted>
          Do not send passwords, full ID numbers, document file contents, bank details, private client notes, or payment screenshots through support.
        </AppText>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  }
});
