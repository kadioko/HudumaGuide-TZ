import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { TextField } from "@/components/TextField";
import { trackAnalyticsEvent } from "@/services/analyticsService";
import { useAppStore } from "@/store/useAppStore";
import { createClientId } from "@/utils/ids";

const schema = z.object({
  message: z.string().min(8, "Please describe what looks outdated")
});

type FormValues = z.infer<typeof schema>;

export default function FeedbackScreen() {
  const { serviceSlug } = useLocalSearchParams<{ serviceSlug?: string }>();
  const addFeedbackReport = useAppStore((state) => state.addFeedbackReport);
  const language = useAppStore((state) => state.language);
  const userProfile = useAppStore((state) => state.userProfile);
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { message: "" }
  });

  function onSubmit(values: FormValues) {
    addFeedbackReport({
      id: createClientId("feedback"),
      serviceSlug,
      category: "outdated_info",
      message: values.message,
      createdAt: new Date().toISOString()
    });
    void trackAnalyticsEvent(
      "outdated_report_submitted",
      { guideSlug: serviceSlug, language },
      userProfile?.id
    );
    router.back();
  }

  return (
    <Screen>
      <SectionHeader title="Report outdated info" subtitle={serviceSlug ? `Guide: ${serviceSlug}` : undefined} />
      <AppCard>
        <AppText muted>
          Tell us what may have changed. In the Supabase version, this maps to `feedback_reports` for admin review.
        </AppText>
        <Controller
          control={control}
          name="message"
          render={({ field: { onChange, value } }) => (
            <TextField label="What should be checked?" value={value} onChangeText={onChange} multiline error={errors.message?.message} />
          )}
        />
        <AppButton title="Submit report" icon="send-outline" onPress={handleSubmit(onSubmit)} />
      </AppCard>
    </Screen>
  );
}
