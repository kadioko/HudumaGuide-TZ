import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { z } from "zod";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { TextField } from "@/components/TextField";
import { colors, spacing } from "@/constants/theme";
import { trackAnalyticsEvent } from "@/services/analyticsService";
import { answerMsaidizi } from "@/services/msaidiziService";
import { useAppStore } from "@/store/useAppStore";
import { pick } from "@/utils/copy";
import { MsaidiziAnswer, msaidiziFallback } from "@/utils/msaidizi";
import { getGuideBySlug } from "@/utils/search";

const schema = z.object({
  question: z.string().min(2, "Ask a question")
});

type FormValues = z.infer<typeof schema>;

const examples = ["NIDA inahitaji nini?", "TIN kwa freelancer", "Kusajili jina la biashara", "Leseni ya udereva renewal"];

export default function MsaidiziScreen() {
  const params = useLocalSearchParams<{ guideSlug?: string; question?: string }>();
  const scopedGuide = getGuideBySlug(params.guideSlug);
  const language = useAppStore((state) => state.language);
  const userProfile = useAppStore((state) => state.userProfile);
  const [answer, setAnswer] = useState<MsaidiziAnswer | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { question: params.question ?? "" }
  });

  async function askQuestion(question: string, guideSlug = scopedGuide?.slug) {
    setIsThinking(true);
    const nextAnswer = await answerMsaidizi(question, language, userProfile?.id, guideSlug);
    setAnswer(nextAnswer);
    setIsThinking(false);
    void trackAnalyticsEvent(
      "msaidizi_asked",
      {
        confidence: nextAnswer.confidence,
        fallbackUsed: nextAnswer.confidence === "fallback",
        guideSlugs: nextAnswer.guides.map((guide) => guide.slug),
        questionLength: question.trim().length,
        scopedGuideSlug: guideSlug,
        language
      },
      userProfile?.id
    );
  }

  async function onSubmit(values: FormValues) {
    await askQuestion(values.question);
  }

  return (
    <Screen>
      <SectionHeader
        title="Msaidizi"
        subtitle={
          language === "sw"
            ? "Anaweza kujibu kwa kutumia guide zilizopo ndani ya app pekee."
            : "Answers only from approved guide content inside the app."
        }
      />

      <InfoBanner
        title={language === "sw" ? "Mipaka ya usalama" : "Safety limits"}
        body={
          language === "sw"
            ? `${msaidiziFallback} Msaidizi hatabuni ada, links au mamlaka rasmi.`
            : "If unsure, Msaidizi will ask you to confirm through official sources. It will not invent fees, links, or official authority."
        }
        tone="warning"
      />

      {scopedGuide ? (
        <InfoBanner
          title={language === "sw" ? "Imefungwa kwenye guide" : "Scoped to this guide"}
          body={
            language === "sw"
              ? `Majibu yataanza na ${pick(language, scopedGuide.titleSw, scopedGuide.titleEn)}. Unaweza kupanua utafutaji ukihitaji.`
              : `Answers start with ${pick(language, scopedGuide.titleSw, scopedGuide.titleEn)}. You can broaden search if needed.`
          }
        />
      ) : null}

      <AppCard>
        <Controller
          control={control}
          name="question"
          render={({ field: { onChange, value } }) => (
            <TextField
              label={language === "sw" ? "Swali lako" : "Your question"}
              placeholder="NIDA, TIN, passport, leseni, BRELA..."
              value={value}
              onChangeText={onChange}
              error={errors.question?.message}
              multiline
            />
          )}
        />
        <View style={styles.examples}>
          {examples.map((example) => (
            <Pill
              key={example}
              label={example}
              onPress={() => {
                setValue("question", example);
                void askQuestion(example);
              }}
            />
          ))}
        </View>
        <AppButton
          title={language === "sw" ? "Uliza Msaidizi" : "Ask Msaidizi"}
          icon="chatbubble-ellipses-outline"
          loading={isThinking}
          onPress={handleSubmit(onSubmit)}
        />
        {scopedGuide ? (
          <AppButton
            title={language === "sw" ? "Panua utafutaji" : "Broaden search"}
            icon="expand-outline"
            variant="secondary"
            loading={isThinking}
            onPress={handleSubmit((values) => askQuestion(values.question, undefined))}
          />
        ) : null}
      </AppCard>

      {answer ? (
        <AppCard>
          <View style={styles.answerHeader}>
            <Pill label={answer.confidence === "grounded" ? "Approved guide content" : "Needs official check"} active={answer.confidence === "grounded"} />
          </View>
          <AppText style={styles.answerText}>{answer.text}</AppText>
          {answer.guides.length ? (
            <View style={styles.guideActions}>
              {answer.citations.map((citation) => (
                <AppCard key={citation.slug} muted>
                  <AppText variant="small" color={colors.green} style={styles.citationTitle}>
                    Source: {citation.title}
                  </AppText>
                  <AppText variant="tiny" muted>
                    Last verified: {citation.lastVerifiedAt || "Needs review"}
                  </AppText>
                </AppCard>
              ))}
              {answer.guides.map((guide) => (
                <AppButton
                  key={guide.slug}
                  title={language === "sw" ? guide.titleSw : guide.titleEn}
                  icon="open-outline"
                  variant="secondary"
                  onPress={() => router.push(`/services/${guide.slug}`)}
                />
              ))}
            </View>
          ) : null}
        </AppCard>
      ) : (
        <AppCard muted>
          <AppText variant="h3">{language === "sw" ? "Mfano wa kutumia" : "Try asking"}</AppText>
          <AppText muted>
            {language === "sw"
              ? "Uliza kuhusu NIDA, TIN, passport, leseni, BRELA au kodi. Majibu yatatoka kwenye guide zilizopo."
              : "Ask about NIDA, TIN, passport, licences, BRELA, or tax. Answers come from existing guides."}
          </AppText>
        </AppCard>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  examples: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  answerHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  answerText: {
    lineHeight: 23,
    color: colors.text
  },
  guideActions: {
    gap: spacing.sm
  },
  citationTitle: {
    fontWeight: "800"
  }
});
