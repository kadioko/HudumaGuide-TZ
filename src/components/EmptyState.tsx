import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { colors, radii, spacing } from "@/constants/theme";
import { AppText } from "./AppText";

type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
};

export function EmptyState({ icon, title, body }: EmptyStateProps) {
  return (
    <View style={styles.empty}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={28} color={colors.green} />
      </View>
      <AppText variant="h3" style={styles.center}>
        {title}
      </AppText>
      <AppText muted style={styles.center}>
        {body}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface
  },
  icon: {
    width: 54,
    height: 54,
    borderRadius: radii.md,
    backgroundColor: colors.greenSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  center: {
    textAlign: "center"
  }
});
