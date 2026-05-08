import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { colors, radii, spacing } from "@/constants/theme";
import { AppText } from "./AppText";

type ChecklistRowProps = {
  title: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
};

export function ChecklistRow({ title, description, checked, onToggle }: ChecklistRowProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={title}
      onPress={onToggle}
      style={({ pressed }) => [styles.row, checked && styles.checkedRow, pressed && styles.pressed]}
    >
      <View style={[styles.box, checked && styles.checkedBox]}>
        {checked ? <Ionicons name="checkmark" size={16} color={colors.surface} /> : null}
      </View>
      <View style={styles.copy}>
        <AppText variant="small" style={styles.title}>
          {title}
        </AppText>
        {description ? (
          <AppText variant="small" muted>
            {description}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  checkedRow: {
    backgroundColor: colors.surfaceMuted
  },
  pressed: {
    opacity: 0.78
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1
  },
  checkedBox: {
    backgroundColor: colors.green,
    borderColor: colors.green
  },
  copy: {
    flex: 1,
    gap: 2
  },
  title: {
    fontWeight: "800"
  }
});
