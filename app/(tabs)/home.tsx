import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { MetricTile } from "@/components/MetricTile";
import { Pill } from "@/components/Pill";
import { SavedGuideCard } from "@/components/SavedGuideCard";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { ServiceCard } from "@/components/ServiceCard";
import { TextField } from "@/components/TextField";
import { colors, spacing } from "@/constants/theme";
import { serviceGuides } from "@/data/serviceGuides";
import { useAppStore } from "@/store/useAppStore";
import { trustNotice, formatDate } from "@/utils/copy";
import { getExpiringDocuments } from "@/utils/documents";
import { searchGuides } from "@/utils/search";

const quickActions = [
  { label: "NIDA", slug: "nida-nin-application" },
  { label: "TIN", slug: "tin-registration" },
  { label: "Passport", slug: "passport-application" },
  { label: "Leseni", slug: "driving-licence-renewal" },
  { label: "Cheti cha kuzaliwa", slug: "birth-certificate-application" },
  { label: "Business Registration", slug: "business-name-registration" },
  { label: "Business Licence", slug: "business-licence-application" },
  { label: "Tax Reminder", slug: "tax-deadline-reminders" }
];

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const language = useAppStore((state) => state.language);
  const savedGuideSlugs = useAppStore((state) => state.savedGuideSlugs);
  const checklistItemsByGuide = useAppStore((state) => state.checklistItemsByGuide);
  const recentGuideSlugs = useAppStore((state) => state.recentGuideSlugs);
  const reminders = useAppStore((state) => state.reminders);
  const userDocuments = useAppStore((state) => state.userDocuments);
  const businessPlans = useAppStore((state) => state.businessPlans);

  const results = useMemo(() => searchGuides(query).slice(0, 3), [query]);
  const savedGuides = serviceGuides.filter((guide) => savedGuideSlugs.includes(guide.slug)).slice(0, 2);
  const recentGuides = recentGuideSlugs
    .map((slug) => serviceGuides.find((guide) => guide.slug === slug))
    .filter(Boolean)
    .slice(0, 2);
  const upcomingReminders = reminders.filter((reminder) => new Date(reminder.date) >= new Date()).slice(0, 2);
  const latestPlan = businessPlans[0];
  const planProgress = latestPlan ? `${latestPlan.completedStepIds.length}/${latestPlan.roadmap.length}` : null;
  const completedChecklistItems = Object.values(checklistItemsByGuide).reduce((total, items) => total + items.length, 0);
  const expiringDocuments = getExpiringDocuments(userDocuments);

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <AppText variant="small" color={colors.green} style={styles.kicker}>
            HudumaGuide TZ
          </AppText>
          <AppText variant="title">{language === "sw" ? "Karibu. Unahitaji huduma gani?" : "Welcome. What service do you need?"}</AppText>
          <AppText muted>
            {language === "sw"
              ? "Tafuta huduma, hifadhi checklist na weka reminders muhimu."
              : "Search services, save checklists, and set important reminders."}
          </AppText>
        </View>
        <View style={styles.heroIcon}>
          <Ionicons name="shield-checkmark-outline" size={32} color={colors.surface} />
        </View>
      </View>

      <TextField
        value={query}
        onChangeText={setQuery}
        placeholder="Unahitaji huduma gani?"
        accessibilityLabel="Search services"
      />

      <View style={styles.metrics}>
        <MetricTile
          label={language === "sw" ? "Checklists" : "Checklists"}
          value={String(savedGuideSlugs.length)}
          icon="bookmark-outline"
        />
        <MetricTile
          label={language === "sw" ? "Hatua done" : "Steps done"}
          value={String(completedChecklistItems)}
          icon="checkmark-done-outline"
          tone="blue"
        />
        <MetricTile
          label={language === "sw" ? "Docs" : "Docs"}
          value={String(userDocuments.length)}
          icon="folder-open-outline"
          tone="gold"
        />
      </View>

      {expiringDocuments.length ? (
        <AppCard>
          <Pill label={language === "sw" ? "Upcoming deadline" : "Upcoming deadline"} active />
          <AppText variant="h3">
            {expiringDocuments[0].title}
          </AppText>
          <AppText muted>
            {language === "sw" ? "Document inahitaji ufuatiliaji kabla ya" : "Document needs follow-up before"}{" "}
            {expiringDocuments[0].expiresOn ? formatDate(expiringDocuments[0].expiresOn) : ""}
          </AppText>
          <AppButton title={language === "sw" ? "Fungua Document Vault" : "Open Document Vault"} icon="folder-open-outline" variant="secondary" onPress={() => router.push("/(tabs)/documents")} />
        </AppCard>
      ) : null}

      {query ? (
        <View style={styles.stack}>
          <SectionHeader title={language === "sw" ? "Matokeo ya haraka" : "Quick results"} />
          {results.map((guide) => (
            <ServiceCard key={guide.id} guide={guide} language={language} />
          ))}
        </View>
      ) : null}

      <AppCard>
        <View style={styles.assistantRow}>
          <View style={styles.assistantIcon}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.green} />
          </View>
          <View style={styles.assistantCopy}>
            <AppText variant="h3">Msaidizi</AppText>
            <AppText muted>
              {language === "sw"
                ? "Uliza kuhusu huduma. Atajibu kwa kutumia guide zilizopo ndani ya app."
                : "Ask about services. Answers use approved in-app guide content."}
            </AppText>
          </View>
        </View>
        <AppButton title={language === "sw" ? "Uliza Msaidizi" : "Ask Msaidizi"} icon="chatbubble-ellipses-outline" variant="secondary" onPress={() => router.push("/msaidizi")} />
      </AppCard>

      <View style={styles.quickGrid}>
        {quickActions.map((action) => (
          <Pressable
            key={action.slug}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={() => router.push(`/services/${action.slug}`)}
            style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
          >
            <AppText variant="small" style={styles.quickText}>
              {action.label}
            </AppText>
          </Pressable>
        ))}
      </View>

      {latestPlan ? (
        <AppCard>
          <AppText variant="h3">{language === "sw" ? "Complete your business setup" : "Complete your business setup"}</AppText>
          <AppText muted>
            {latestPlan.businessName}: {language === "sw" ? "maendeleo" : "progress"} {planProgress}
          </AppText>
          <AppButton title={language === "sw" ? "Endelea" : "Continue"} icon="arrow-forward-outline" onPress={() => router.push({ pathname: "/biashara/roadmap", params: { planId: latestPlan.id } })} />
        </AppCard>
      ) : null}

      <View style={styles.stack}>
        <View style={styles.sectionWithAction}>
          <SectionHeader title={language === "sw" ? "Saved checklists" : "Saved checklists"} />
          {savedGuides.length ? (
            <AppButton title={language === "sw" ? "Zote" : "All"} variant="ghost" onPress={() => router.push("/checklists")} />
          ) : null}
        </View>
        {savedGuides.length ? (
          savedGuides.map((guide) => (
            <SavedGuideCard
              key={guide.id}
              guide={guide}
              language={language}
              completedItemIds={checklistItemsByGuide[guide.slug]}
            />
          ))
        ) : (
          <AppCard muted>
            <AppText variant="h3">{language === "sw" ? "Bado hujahifadhi checklist" : "No saved checklists yet"}</AppText>
            <AppText muted>
              {language === "sw" ? "Fungua guide kisha bonyeza Hifadhi checklist." : "Open a guide and tap Save checklist."}
            </AppText>
          </AppCard>
        )}
      </View>

      <View style={styles.stack}>
        <SectionHeader title={language === "sw" ? "Upcoming reminders" : "Upcoming reminders"} />
        {upcomingReminders.length ? (
          upcomingReminders.map((reminder) => (
            <AppCard key={reminder.id}>
              <Pill label={reminder.category} />
              <AppText variant="h3">{reminder.title}</AppText>
              <AppText muted>{formatDate(reminder.date)}</AppText>
            </AppCard>
          ))
        ) : (
          <AppButton title={language === "sw" ? "Weka reminder" : "Create reminder"} icon="alarm-outline" onPress={() => router.push("/reminders/create")} />
        )}
      </View>

      <View style={styles.stack}>
        <SectionHeader title={language === "sw" ? "Popular guides this week" : "Popular guides this week"} />
        {serviceGuides.slice(0, 3).map((guide) => (
          <ServiceCard key={guide.id} guide={guide} language={language} />
        ))}
      </View>

      {recentGuides.length ? (
        <View style={styles.stack}>
          <SectionHeader title={language === "sw" ? "Continue where you stopped" : "Continue where you stopped"} />
          {recentGuides.map((guide) => (guide ? <ServiceCard key={guide.id} guide={guide} language={language} /> : null))}
        </View>
      ) : null}

      <InfoBanner title="Independent guide" body={trustNotice} tone="warning" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs
  },
  kicker: {
    fontWeight: "900"
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center"
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.sm
  },
  sectionWithAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  quickAction: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: "center"
  },
  pressed: {
    opacity: 0.75
  },
  quickText: {
    fontWeight: "800"
  },
  stack: {
    gap: spacing.md
  },
  assistantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  assistantIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center"
  },
  assistantCopy: {
    flex: 1,
    gap: spacing.xs
  }
});
