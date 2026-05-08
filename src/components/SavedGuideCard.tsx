import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { Language, ServiceGuide } from "@/types";
import { pick } from "@/utils/copy";
import { getGuideProgress } from "@/utils/progress";
import { AppCard } from "./AppCard";
import { AppText } from "./AppText";
import { ProgressBar } from "./ProgressBar";

type SavedGuideCardProps = {
  guide: ServiceGuide;
  language: Language;
  completedItemIds?: string[];
};

export function SavedGuideCard({ guide, language, completedItemIds = [] }: SavedGuideCardProps) {
  const progress = getGuideProgress(guide, completedItemIds);

  return (
    <Link href={`/services/${guide.slug}`} asChild>
      <Pressable accessibilityRole="button" accessibilityLabel={pick(language, guide.titleSw, guide.titleEn)}>
        <AppCard>
          <View style={styles.header}>
            <View style={styles.icon}>
              <Ionicons name="bookmark" size={18} color={colors.green} />
            </View>
            <View style={styles.copy}>
              <AppText variant="h3">{pick(language, guide.titleSw, guide.titleEn)}</AppText>
              <AppText variant="small" muted>
                {progress.completed}/{progress.total} {language === "sw" ? "zimekamilika" : "complete"}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
          <ProgressBar value={progress.score} />
        </AppCard>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    flex: 1,
    gap: 2
  }
});
