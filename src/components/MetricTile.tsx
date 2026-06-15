import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { colors, radii, spacing } from "@/constants/theme";
import { AppText } from "./AppText";

type MetricTileProps = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: "green" | "blue" | "gold";
};

export function MetricTile({ label, value, icon, tone = "green" }: MetricTileProps) {
  const accent = tone === "blue" ? colors.blue : tone === "gold" ? colors.gold : colors.green;
  const soft = tone === "blue" ? colors.blueSoft : tone === "gold" ? colors.goldSoft : colors.greenSoft;

  return (
    <View style={styles.tile}>
      <View style={[styles.icon, { backgroundColor: soft }]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <AppText variant="h2">{value}</AppText>
      <AppText variant="small" muted style={styles.label}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 104,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs,
    justifyContent: "center"
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    fontWeight: "700"
  }
});
