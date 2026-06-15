import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { MetricTile } from "@/components/MetricTile";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { colors, spacing } from "@/constants/theme";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getLocalAdminGuides } from "@/services/adminContentService";
import { useAppStore } from "@/store/useAppStore";
import { ServiceGuide } from "@/types";
import { getGuideFreshness, getGuideSourceConfidence } from "@/utils/guideTrust";

export default function AdminIndexScreen() {
  const { width } = useWindowDimensions();
  const isNarrow = width < 430;
  const profile = useAppStore((state) => state.userProfile);
  const isAdmin = profile?.email?.includes("admin") || false;
  const guides = getLocalAdminGuides();
  const trustCounts = guides.reduce(
    (counts, guide) => {
      const freshness = getGuideFreshness({
        slug: guide.slug,
        lastVerifiedAt: guide.lastVerifiedAt ?? "",
        expiresReviewAt: guide.expiresReviewAt,
        verificationStatus: guide.verificationStatus
      } as ServiceGuide);

      return {
        verified: counts.verified + (freshness.label === "Verified" ? 1 : 0),
        reviewSoon: counts.reviewSoon + (freshness.label === "Review soon" ? 1 : 0),
        outdated: counts.outdated + (freshness.label === "Outdated" || freshness.label === "Needs review" ? 1 : 0),
        missingLinks: counts.missingLinks + (!guide.officialUrl?.startsWith("https://") ? 1 : 0),
        missingReviewer: counts.missingReviewer + (!guide.sourceLastCheckedBy ? 1 : 0),
        missingSourceRefs: counts.missingSourceRefs + (!(guide.officialSourceRefs?.length) ? 1 : 0)
      };
    },
    { verified: 0, reviewSoon: 0, outdated: 0, missingLinks: 0, missingReviewer: 0, missingSourceRefs: 0 }
  );

  return (
    <Screen>
      <AppCard style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="shield-checkmark-outline" size={25} color={colors.green} />
        </View>
        <View style={styles.flex}>
          <SectionHeader title="Admin content console" subtitle="Service guide publishing, review, and content quality workflows." />
        </View>
      </AppCard>
      <InfoBanner
        title={isSupabaseConfigured ? "Supabase admin mode" : "Local planning mode"}
        body={
          isSupabaseConfigured
            ? "Admin writes require an authenticated profile with role=admin in Supabase RLS."
            : "Supabase is not configured, so these screens show the management workflow without writing remote data."
        }
        tone="warning"
      />
      {!isAdmin ? (
        <InfoBanner
          title="Admin access required"
          body="This MVP surfaces the console for setup, but Supabase RLS must enforce role=admin before production use."
          tone="warning"
        />
      ) : null}

      <AppCard>
        <AppText variant="h3">Content operations</AppText>
        <AppText muted>
          Manage categories, guides, official-source references, verification status, review expiry, and outdated-info reports.
        </AppText>
      </AppCard>

      <AppCard>
        <AppText variant="h3">Source confidence</AppText>
        {getLocalAdminGuides().slice(0, 5).map((guide) => {
          const confidence = getGuideSourceConfidence({
            ...guide,
            id: guide.slug,
            categoryId: guide.categoryId ?? "",
            titleSw: guide.titleSw,
            whoNeedsItSw: "",
            whoNeedsItEn: "",
            estimatedTime: "",
            estimatedCostNote: "",
            physicalLocationNote: "",
            complexity: "Medium",
            keywords: [],
            requiredDocuments: JSON.parse(guide.requiredDocumentsJson ?? "[]"),
            steps: JSON.parse(guide.stepsJson ?? "[]"),
            commonMistakesSw: [],
            commonMistakesEn: [],
            faqs: [],
            lastVerifiedAt: guide.lastVerifiedAt ?? "",
            disclaimer: "",
            published: guide.published
          } as ServiceGuide);
          return (
            <View key={guide.slug} style={styles.confidenceRow}>
              <AppText variant="small" style={styles.confidenceTitle}>{guide.titleEn}</AppText>
              <Pill label={`${confidence.score}%`} active={confidence.score >= 85} />
            </View>
          );
        })}
      </AppCard>

      <AppCard>
        <View style={styles.cardHeader}>
          <AppText variant="h3">Trust workflow</AppText>
          <AppText variant="tiny" color={colors.green}>
            {guides.length} guides
          </AppText>
        </View>
        <View style={styles.metrics}>
          <MetricTile label="Verified" value={String(trustCounts.verified)} icon="shield-checkmark-outline" />
          <MetricTile label="Review soon" value={String(trustCounts.reviewSoon)} icon="time-outline" tone="gold" />
          <MetricTile label="Outdated" value={String(trustCounts.outdated)} icon="alert-circle-outline" tone="blue" />
        </View>
        <View style={styles.metrics}>
          <MetricTile label="Missing links" value={String(trustCounts.missingLinks)} icon="link-outline" tone="gold" />
          <MetricTile label="No reviewer" value={String(trustCounts.missingReviewer)} icon="person-outline" tone="blue" />
          <MetricTile label="No source refs" value={String(trustCounts.missingSourceRefs)} icon="documents-outline" tone="gold" />
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="h3">Admin shortcuts</AppText>
        <View style={styles.actionGrid}>
          <AppButton title="Categories" icon="albums-outline" compact onPress={() => router.push("/admin/categories")} style={isNarrow ? styles.actionTileFull : styles.actionTile} />
          <AppButton title="Guides" icon="document-text-outline" variant="secondary" compact onPress={() => router.push("/admin/guides")} style={isNarrow ? styles.actionTileFull : styles.actionTile} />
          <AppButton title="Reports" icon="flag-outline" variant="secondary" compact onPress={() => router.push("/admin/reports")} style={isNarrow ? styles.actionTileFull : styles.actionTile} />
          <AppButton title="Analytics" icon="analytics-outline" variant="secondary" compact onPress={() => router.push("/admin/analytics")} style={isNarrow ? styles.actionTileFull : styles.actionTile} />
          <AppButton title="Versions" icon="git-branch-outline" variant="secondary" compact onPress={() => router.push("/admin/versions")} style={isNarrow ? styles.actionTileFull : styles.actionTile} />
          <AppButton title="Storage cleanup" icon="shield-checkmark-outline" variant="secondary" compact onPress={() => router.push("/admin/storage-cleanup")} style={isNarrow ? styles.actionTileFull : styles.actionTile} />
        </View>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: colors.greenSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  flex: {
    flex: 1
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.sm
  },
  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  confidenceTitle: {
    flex: 1,
    fontWeight: "800"
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  actionTile: {
    flexBasis: "48%",
    flexGrow: 1
  },
  actionTileFull: {
    flexBasis: "100%",
    flexGrow: 1
  }
});
