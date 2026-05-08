import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { serviceCategories } from "@/data/serviceCategories";
import { ServiceGuide, Language } from "@/types";
import { pick } from "@/utils/copy";
import { AppCard } from "./AppCard";
import { AppText } from "./AppText";
import { Pill } from "./Pill";

type ServiceCardProps = {
  guide: ServiceGuide;
  language: Language;
};

export function ServiceCard({ guide, language }: ServiceCardProps) {
  const category = serviceCategories.find((item) => item.id === guide.categoryId);

  return (
    <Link href={`/services/${guide.slug}`} asChild>
      <AppCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Ionicons name={(category?.icon ?? "document-text-outline") as keyof typeof Ionicons.glyphMap} size={22} color={colors.green} />
          </View>
          <View style={styles.titleWrap}>
            <AppText variant="h3">{pick(language, guide.titleSw, guide.titleEn)}</AppText>
            <AppText variant="small" muted>
              {pick(language, category?.titleSw ?? "", category?.titleEn ?? "")}
            </AppText>
          </View>
        </View>
        <AppText muted>{pick(language, guide.summarySw, guide.summaryEn)}</AppText>
        <View style={styles.footer}>
          <Pill label={guide.complexity} />
          <Pill label={guide.estimatedTime.split(" ").slice(0, 4).join(" ")} />
          <View style={styles.viewSteps}>
            <AppText variant="small" color={colors.green} style={styles.viewText}>
              {language === "sw" ? "Angalia hatua" : "View steps"}
            </AppText>
            <Ionicons name="chevron-forward" size={16} color={colors.green} />
          </View>
        </View>
      </AppCard>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md
  },
  header: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center"
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center"
  },
  titleWrap: {
    flex: 1,
    gap: 2
  },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm
  },
  viewSteps: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  viewText: {
    fontWeight: "800"
  }
});
