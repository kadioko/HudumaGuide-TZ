import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { colors, radii, spacing } from "@/constants/theme";
import { AppText } from "./AppText";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export function AppButton({
  title,
  onPress,
  variant = "primary",
  icon,
  disabled,
  loading,
  compact,
  style
}: AppButtonProps) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const textColor = isPrimary || isDanger ? colors.surface : colors.green;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: Boolean(disabled || loading), busy: Boolean(loading) }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        styles[variant],
        (disabled || loading) && styles.disabled,
        pressed && !disabled ? styles.pressed : null,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={textColor} /> : null}
          <AppText variant="small" color={textColor} style={styles.label}>
            {title}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1
  },
  compact: {
    minHeight: 42,
    paddingHorizontal: spacing.md
  },
  primary: {
    backgroundColor: colors.green,
    borderColor: colors.green
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent"
  },
  danger: {
    backgroundColor: colors.red,
    borderColor: colors.red
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }]
  },
  disabled: {
    opacity: 0.5
  },
  label: {
    fontWeight: "800",
    textAlign: "center",
    flexShrink: 1
  }
});
