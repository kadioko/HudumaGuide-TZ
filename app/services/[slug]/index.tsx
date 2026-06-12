import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo } from "react";
import { Alert, Linking, Share, StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { ChecklistRow } from "@/components/ChecklistRow";
import { InfoBanner } from "@/components/InfoBanner";
import { Pill } from "@/components/Pill";
import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { SyncBanner } from "@/components/SyncBanner";
import { GuideFreshnessBadge } from "@/components/GuideFreshnessBadge";
import { colors, spacing } from "@/constants/theme";
import { serviceCategories } from "@/data/serviceCategories";
import { useAppStore } from "@/store/useAppStore";
import { legalTaxNotice, pick, trustNotice } from "@/utils/copy";
import { getGuideFreshness, getGuideSourceConfidence, getRegionNote } from "@/utils/guideTrust";
import { getGuideProgress } from "@/utils/progress";
import { getGuideBySlug } from "@/utils/search";

const emptyChecklistItems: string[] = [];

export default function ServiceDetailsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const guide = getGuideBySlug(slug);
  const globalLanguage = useAppStore((state) => state.language);
  const screenLanguages = useAppStore((state) => state.screenLanguages);
  const setScreenLanguage = useAppStore((state) => state.setScreenLanguage);
  const screenKey = `guide:${slug ?? "unknown"}`;
  const language = screenLanguages[screenKey] ?? globalLanguage;
  const savedGuideSlugs = useAppStore((state) => state.savedGuideSlugs);
  const checklistItems = useAppStore((state) => state.checklistItemsByGuide[slug ?? ""] ?? emptyChecklistItems);
  const toggleGuideSaved = useAppStore((state) => state.toggleGuideSaved);
  const toggleChecklistItem = useAppStore((state) => state.toggleChecklistItem);
  const addRecentGuide = useAppStore((state) => state.addRecentGuide);
  const userProfile = useAppStore((state) => state.userProfile);

  useEffect(() => {
    if (guide) {
      addRecentGuide(guide.slug);
    }
  }, [addRecentGuide, guide]);

  const readiness = useMemo(() => {
    if (!guide) {
      return { score: 0, missing: [] as string[] };
    }

    const progress = getGuideProgress(guide, checklistItems);
    const missing = guide.requiredDocuments
      .filter((document) => !checklistItems.includes(`doc-${document.id}`))
      .map((document) => pick(language, document.titleSw, document.titleEn));

    return {
      ...progress,
      missing
    };
  }, [checklistItems, guide, language]);

  if (!guide) {
    return (
      <Screen>
        <AppCard>
          <AppText variant="h2">Guide not found</AppText>
          <AppButton title="Back to services" onPress={() => router.replace("/(tabs)/services")} />
        </AppCard>
      </Screen>
    );
  }

  const selectedGuide = guide;
  const category = serviceCategories.find((item) => item.id === selectedGuide.categoryId);
  const isSaved = savedGuideSlugs.includes(selectedGuide.slug);
  const freshness = getGuideFreshness(selectedGuide);
  const sourceConfidence = getGuideSourceConfidence(selectedGuide);
  const regionNote = getRegionNote(selectedGuide, userProfile?.region, userProfile?.city);

  async function openOfficialPortal() {
    if (!selectedGuide.officialUrl?.startsWith("https://")) {
      Alert.alert(
        "Official link pending",
        "This guide is missing a verified HTTPS official link. Confirm through the relevant official office or portal."
      );
      return;
    }

    await Linking.openURL(selectedGuide.officialUrl);
  }

  async function openSourceUrl(url?: string) {
    if (!url) {
      await openOfficialPortal();
      return;
    }

    await Linking.openURL(url);
  }

  function createReminderFromTemplate(stepTitle: string, template: NonNullable<(typeof selectedGuide.steps)[number]["reminderTemplate"]>) {
    router.push({
      pathname: "/reminders/create",
      params: {
        linkedServiceSlug: selectedGuide.slug,
        title: pick(language, template.titleSw, template.titleEn) || stepTitle,
        category: template.category,
        offsetDays: String(template.offsetDays ?? 7)
      }
    });
  }

  async function shareGuide() {
    await Share.share({
      message: `${pick(language, selectedGuide.titleSw, selectedGuide.titleEn)} - HudumaGuide TZ\n${pick(language, selectedGuide.summarySw, selectedGuide.summaryEn)}\n\n${trustNotice}`
    });
  }

  async function shareChecklist() {
    const documentLines = selectedGuide.requiredDocuments.map((document) => {
      const isDone = checklistItems.includes(`doc-${document.id}`);
      return `${isDone ? "[x]" : "[ ]"} ${pick(language, document.titleSw, document.titleEn)}`;
    });
    const stepLines = selectedGuide.steps.map((step, index) => {
      const isDone = checklistItems.includes(`step-${step.id}`);
      return `${isDone ? "[x]" : "[ ]"} ${language === "sw" ? "Hatua ya" : "Step"} ${index + 1}: ${pick(language, step.titleSw, step.titleEn)}`;
    });

    await Share.share({
      message: [
        `${pick(language, selectedGuide.titleSw, selectedGuide.titleEn)} - HudumaGuide TZ`,
        language === "sw" ? `Uko tayari ${readiness.score}%` : `You are ${readiness.score}% ready`,
        "",
        language === "sw" ? "Nyaraka unazohitaji:" : "Required documents:",
        ...documentLines,
        "",
        language === "sw" ? "Hatua kwa hatua:" : "Step by step:",
        ...stepLines,
        "",
        selectedGuide.estimatedCostNote,
        trustNotice
      ].join("\n")
    });
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pill label={pick(language, category?.titleSw ?? "", category?.titleEn ?? "")} />
        <GuideFreshnessBadge guide={selectedGuide} />
        <View style={styles.inlineActions}>
          <Pill label="Kiswahili" active={language === "sw"} onPress={() => setScreenLanguage(screenKey, "sw")} />
          <Pill label="English" active={language === "en"} onPress={() => setScreenLanguage(screenKey, "en")} />
        </View>
        <AppText variant="title">{pick(language, selectedGuide.titleSw, selectedGuide.titleEn)}</AppText>
        <AppText muted>{pick(language, selectedGuide.summarySw, selectedGuide.summaryEn)}</AppText>
      </View>

      <InfoBanner title="Independent guide" body={trustNotice} tone="warning" />
      <InfoBanner
        title={`Source confidence: ${sourceConfidence.score}%`}
        body={`${sourceConfidence.label}. ${sourceConfidence.passed}/${sourceConfidence.total} source checks are complete for this guide.`}
        tone={sourceConfidence.score >= 85 ? "info" : "warning"}
      />
      <InfoBanner
        title={freshness.label}
        body={
          language === "sw"
            ? `Mwongozo huu ulihakikiwa siku ${freshness.daysSinceVerified} zilizopita. Hakiki hatua za mwisho kupitia chanzo rasmi.`
            : `This guide was last checked ${freshness.daysSinceVerified} days ago. Confirm final steps through official sources.`
        }
        tone={freshness.tone === "danger" ? "warning" : freshness.tone === "warning" ? "warning" : "info"}
      />
      {selectedGuide.changeSummaryEn || selectedGuide.changeSummarySw ? (
        <InfoBanner title={language === "sw" ? "Kilichobadilika" : "What changed"} body={pick(language, selectedGuide.changeSummarySw ?? "", selectedGuide.changeSummaryEn ?? "")} />
      ) : null}
      {regionNote ? (
        <InfoBanner title={language === "sw" ? "Dokezo la eneo lako" : "Local note"} body={pick(language, regionNote.noteSw, regionNote.noteEn)} />
      ) : null}
      <SyncBanner />

      <AppCard>
        <View style={styles.scoreHeader}>
          <View style={styles.scoreIcon}>
            <Ionicons name="checkmark-done-outline" size={22} color={colors.green} />
          </View>
          <View style={styles.flex}>
            <AppText variant="h3">
              {language === "sw" ? `Uko tayari ${readiness.score}%` : `You are ${readiness.score}% ready`}
            </AppText>
            <AppText muted>
              {readiness.missing.length
                ? `${language === "sw" ? "Inakosekana" : "Missing"}: ${readiness.missing.slice(0, 2).join(", ")}`
                : language === "sw"
                  ? "Checklist yako inaonekana vizuri."
                  : "Your checklist looks good."}
            </AppText>
          </View>
        </View>
        <ProgressBar value={readiness.score} />
      </AppCard>

      <View style={styles.buttonGrid}>
        <AppButton
          title={isSaved ? "Imehifadhiwa" : "Hifadhi checklist"}
          icon={isSaved ? "bookmark" : "bookmark-outline"}
          onPress={() => toggleGuideSaved(selectedGuide.slug)}
          style={styles.gridButton}
        />
        <AppButton
          title="Nikumbushe"
          icon="alarm-outline"
          variant="secondary"
          onPress={() =>
            router.push({
              pathname: "/reminders/create",
              params: { linkedServiceSlug: selectedGuide.slug, title: pick(language, selectedGuide.titleSw, selectedGuide.titleEn) }
            })
          }
          style={styles.gridButton}
        />
      </View>
      <AppButton
        title={language === "sw" ? "Fungua checklist kamili" : "Open full checklist"}
        icon="list-outline"
        variant="secondary"
        onPress={() => router.push(`/services/${selectedGuide.slug}/checklist`)}
      />
      <AppButton
        title={language === "sw" ? "Muulize Msaidizi kuhusu guide hii" : "Ask Msaidizi about this guide"}
        icon="chatbubble-ellipses-outline"
        variant="secondary"
        onPress={() =>
          router.push({
            pathname: "/msaidizi",
            params: { guideSlug: selectedGuide.slug, question: pick(language, selectedGuide.titleSw, selectedGuide.titleEn) }
          })
        }
      />

      <AppCard>
        <SectionHeader title={language === "sw" ? "Nani anahitaji?" : "Who needs it?"} />
        <AppText muted>{pick(language, selectedGuide.whoNeedsItSw, selectedGuide.whoNeedsItEn)}</AppText>
      </AppCard>

      <AppCard>
        <SectionHeader title={language === "sw" ? "Nyaraka unazohitaji" : "Required documents"} />
        {selectedGuide.requiredDocuments.map((document) => (
          <View key={document.id} style={styles.linkedChecklistItem}>
            <ChecklistRow
              title={pick(language, document.titleSw, document.titleEn)}
              description={pick(language, document.noteSw ?? "", document.noteEn ?? "") || undefined}
              checked={checklistItems.includes(`doc-${document.id}`)}
              onToggle={() => toggleChecklistItem(selectedGuide.slug, `doc-${document.id}`)}
            />
            <AppButton title={language === "sw" ? "Chanzo rasmi" : "Official source"} icon="open-outline" variant="ghost" onPress={() => openSourceUrl(document.officialSourceUrl)} />
          </View>
        ))}
      </AppCard>

      <AppCard>
        <SectionHeader title={language === "sw" ? "Hatua kwa hatua" : "Step by step"} />
        {selectedGuide.steps.map((step, index) => (
          <View key={step.id} style={styles.linkedChecklistItem}>
            <ChecklistRow
              title={`${language === "sw" ? "Hatua ya" : "Step"} ${index + 1}: ${pick(language, step.titleSw, step.titleEn)}`}
              description={pick(language, step.descriptionSw, step.descriptionEn)}
              checked={checklistItems.includes(`step-${step.id}`)}
              onToggle={() => toggleChecklistItem(selectedGuide.slug, `step-${step.id}`)}
            />
            <View style={styles.inlineActions}>
              <AppButton title={language === "sw" ? "Chanzo" : "Source"} icon="open-outline" variant="ghost" onPress={() => openSourceUrl(step.officialSourceUrl)} />
              {step.reminderTemplate ? (
                <AppButton
                  title={language === "sw" ? "Reminder" : "Reminder"}
                  icon="alarm-outline"
                  variant="ghost"
                  onPress={() => createReminderFromTemplate(pick(language, step.titleSw, step.titleEn), step.reminderTemplate as NonNullable<typeof step.reminderTemplate>)}
                />
              ) : null}
            </View>
          </View>
        ))}
      </AppCard>

      <AppCard>
        <SectionHeader title={language === "sw" ? "Muda na gharama" : "Timeline and cost"} />
        <AppText muted>{selectedGuide.estimatedTime}</AppText>
        <InfoBanner body={selectedGuide.estimatedCostNote} tone="warning" />
      </AppCard>

      <AppCard>
        <SectionHeader title={language === "sw" ? "Makosa ya kuepuka" : "Common mistakes"} />
        {(language === "sw" ? selectedGuide.commonMistakesSw : selectedGuide.commonMistakesEn).map((mistake) => (
          <View key={mistake} style={styles.bullet}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.gold} />
            <AppText muted style={styles.flex}>
              {mistake}
            </AppText>
          </View>
        ))}
      </AppCard>

      <AppCard>
        <SectionHeader title="Official source" subtitle={selectedGuide.physicalLocationNote} />
        <AppButton title="Fungua tovuti rasmi" icon="open-outline" onPress={openOfficialPortal} />
      </AppCard>

      <View style={styles.buttonGrid}>
        <AppButton title="Share" icon="logo-whatsapp" variant="secondary" onPress={shareGuide} style={styles.gridButton} />
        <AppButton title={language === "sw" ? "Share checklist" : "Share checklist"} icon="share-social-outline" variant="secondary" onPress={shareChecklist} style={styles.gridButton} />
      </View>

      <View style={styles.buttonGrid}>
        <AppButton
          title="Report outdated info"
          icon="flag-outline"
          variant="secondary"
          onPress={() => router.push({ pathname: "/feedback", params: { serviceSlug: selectedGuide.slug } })}
          style={styles.gridButton}
        />
      </View>

      <InfoBanner body={`${selectedGuide.disclaimer} ${legalTaxNotice}`} tone="warning" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm
  },
  scoreHeader: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center"
  },
  scoreIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center"
  },
  flex: {
    flex: 1
  },
  buttonGrid: {
    flexDirection: "row",
    gap: spacing.sm
  },
  gridButton: {
    flex: 1
  },
  bullet: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  linkedChecklistItem: {
    gap: spacing.xs
  },
  inlineActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  }
});
