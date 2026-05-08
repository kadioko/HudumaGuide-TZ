import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { colors, radii, spacing } from "@/constants/theme";
import { AppText } from "./AppText";

type InfoBannerProps = {
  title?: string;
  body: string;
  tone?: "info" | "warning" | "success";
};

export function InfoBanner({ title, body, tone = "info" }: InfoBannerProps) {
  const iconColor = tone === "warning" ? colors.warning : tone === "success" ? colors.success : colors.blue;
  return (
    <View style={styles.banner}>
      <Ionicons name="shield-checkmark-outline" size={22} color={iconColor} />
      <View style={styles.copy}>
        {title ? <AppText variant="small" style={styles.title}>{title}</AppText> : null}
        <AppText variant="small" muted>
          {body}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md
  },
  copy: {
    flex: 1,
    gap: spacing.xs
  },
  title: {
    fontWeight: "800"
  }
});
