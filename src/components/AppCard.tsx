import { ReactNode } from "react";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors, radii, shadow, spacing } from "@/constants/theme";

type AppCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  muted?: boolean;
};

export function AppCard({ children, style, muted }: AppCardProps) {
  return <View style={[styles.card, muted && styles.muted, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow
  },
  muted: {
    backgroundColor: colors.surfaceMuted,
    ...Platform.select({
      web: {
        boxShadow: "none"
      },
      default: {
        shadowOpacity: 0,
        elevation: 0
      }
    })
  }
});
