import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { LanguageToggle } from "@/components/LanguageToggle";
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
import { getGuideFreshness, getGuideSourceConfidence } from "@/utils/guideTrust";
import { searchGuides } from "@/utils/search";

type QuickAction = {
  label: string;
  slug: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const quickActions: QuickAction[] = [
  { label: "NIDA", slug: "nida-nin-application", icon: "id-card-outline" },
  { label: "TIN", slug: "tin-registration", icon: "receipt-outline" },
  { label: "Passport", slug: "passport-application", icon: "airplane-outline" },
  { label: "Leseni", slug: "driving-licence-renewal", icon: "car-outline" },
  { label: "Birth cert", slug: "birth-certificate-application", icon: "document-text-outline" },
  { label: "BRELA", slug: "business-name-registration", icon: "briefcase-outline" },
  { label: "Licence", slug: "business-licence-application", icon: "storefront-outline" },
  { label: "Tax date", slug: "tax-deadline-reminders", icon: "calendar-outline" }
];

const personaPriority: Record<string, string[]> = {
  business_owner: ["business-name-registration", "limited-company-registration", "business-licence-application", "tin-registration"],
  driver: ["driving-licence-renewal", "nida-nin-application"],
  student: ["birth-certificate-application", "nida-nin-application", "passport-application"],
  family_admin: ["birth-certificate-application", "nida-nin-application", "passport-application"],
  citizen: ["nida-nin-application", "tin-registration", "passport-application"]
};

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const language = useAppStore((state) => state.language);
  const savedGuideSlugs = useAppStore((state) => state.savedGuideSlugs);
  const checklistItemsByGuide = useAppStore((state) => state.checklistItemsByGuide);
  const recentGuideSlugs = useAppStore((state) => state.recentGuideSlugs);
  const reminders = useAppStore((state) => state.reminders);
  const userDocuments = useAppStore((state) => state.userDocuments);
  const businessPlans = useAppStore((state) => state.businessPlans);
  const onboardingPersona = useAppStore((state) => state.onboardingPersona);

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
  const verifiedGuides = serviceGuides.filter((guide) => getGuideFreshness(guide).label === "Verified").length;
  const averageConfidence = Math.round(
    serviceGuides.reduce((total, guide) => total + getGuideSourceConfidence(guide).score, 0) / serviceGuides.length
  );
  const prioritizedQuickActions = useMemo(() => {
    const priority = personaPriority[onboardingPersona ?? "citizen"] ?? [];
    const rank = (slug: string) => {
      const index = priority.indexOf(slug);
      return index === -1 ? priority.length + 1 : index;
    };
    return [...quickActions].sort((a, b) => rank(a.slug) - rank(b.slug));
  }, [onboardingPersona]);

  return (
    <Screen>
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} />
          <View>
            <AppText variant="h3">HudumaGuide TZ</AppText>
            <AppText variant="tiny" muted>
              {language === "sw" ? "Mwongozo huru wa huduma" : "Independent service guide"}
            </AppText>
          </View>
        </View>
        <LanguageToggle compact />
      </View>

      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <AppText variant="title">{language === "sw" ? "Pata hatua sahihi kabla hujaenda ofisini." : "Know the next step before you visit."}</AppText>
          <AppText muted>
            {language === "sw"
              ? "Tafuta huduma, hifadhi checklist, fuatilia nyaraka na weka reminders bila kupoteza taarifa muhimu."
              : "Search services, save checklists, track documents, and set reminders without losing the thread."}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={language === "sw" ? "Uliza Msaidizi" : "Ask Msaidizi"}
          onPress={() => router.push("/msaidizi")}
          style={({ pressed }) => [styles.assistantBubble, pressed && styles.pressed]}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.surface} />
        </Pressable>
      </View>

      <TextField
        value={query}
        onChangeText={setQuery}
        placeholder={language === "sw" ? "NIDA, TIN, leseni, passport..." : "NIDA, TIN, licence, passport..."}
        accessibilityLabel="Search services"
      />

      <AppCard style={styles.trustCard}>
        <View style={styles.trustHeader}>
          <View style={styles.trustIcon}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.green} />
          </View>
          <View style={styles.trustCopy}>
            <AppText variant="h3">{language === "sw" ? "Trust status" : "Trust status"}</AppText>
            <AppText variant="small" muted>
              {language === "sw" ? "Chanzo, tarehe ya review na link rasmi hukaguliwa." : "Sources, review dates, and official links are checked."}
            </AppText>
          </View>
        </View>
        <View style={styles.trustStats}>
          <Pill label={`${verifiedGuides}/${serviceGuides.length} verified`} tone="success" />
          <Pill label={`${averageConfidence}% source score`} tone={averageConfidence >= 85 ? "success" : "warning"} />
        </View>
      </AppCard>

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
          {prioritizedQuickActions.map((action) => (
          <Pressable
            key={action.slug}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={() => router.push(`/services/${action.slug}`)}
            style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
          >
            <View style={styles.quickIcon}>
              <Ionicons name={action.icon} size={18} color={colors.green} />
            </View>
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexShrink: 1
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 8
  },
  hero: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg,
    paddingVertical: spacing.sm
  },
  heroCopy: {
    flex: 1,
    gap: spacing.sm
  },
  assistantBubble: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center"
  },
  trustCard: {
    gap: spacing.md
  },
  trustHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  trustIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.greenSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  trustCopy: {
    flex: 1,
    gap: 2
  },
  trustStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
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
    minHeight: 68,
    width: "23%",
    minWidth: 76,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  quickIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.greenSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  pressed: {
    opacity: 0.78,
    transform: [{ translateY: 1 }]
  },
  quickText: {
    fontWeight: "800",
    textAlign: "center"
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
