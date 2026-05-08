import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { colors, radii, spacing } from "@/constants/theme";
import { AppText } from "./AppText";

type PillProps = {
  label: string;
  active?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

export function Pill({ label, active, icon, onPress }: PillProps) {
  const content = (
    <>
      {icon ? <Ionicons name={icon} size={15} color={active ? colors.surface : colors.green} /> : null}
      <AppText variant="small" color={active ? colors.surface : colors.text} style={styles.label}>
        {label}
      </AppText>
    </>
  );

  if (!onPress) {
    return <Pressable style={[styles.pill, active && styles.active]}>{content}</Pressable>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.pill, active && styles.active, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  active: {
    backgroundColor: colors.green,
    borderColor: colors.green
  },
  pressed: {
    opacity: 0.78
  },
  label: {
    fontWeight: "700"
  }
});
