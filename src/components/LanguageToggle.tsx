import { Pressable, StyleSheet, View } from "react-native";
import { colors, radii, spacing } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { AppText } from "./AppText";

type LanguageToggleProps = {
  compact?: boolean;
};

export function LanguageToggle({ compact }: LanguageToggleProps) {
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);

  return (
    <View style={styles.wrapper}>
      {!compact ? (
        <AppText variant="small" muted style={styles.label}>
          Language / Lugha
        </AppText>
      ) : null}
      <View style={styles.row}>
        {[
          { id: "sw" as const, label: compact ? "SW" : "Kiswahili" },
          { id: "en" as const, label: compact ? "EN" : "English" }
        ].map((option) => {
          const active = language === option.id;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: active }}
              onPress={() => setLanguage(option.id)}
              style={({ pressed }) => [styles.choice, active && styles.activeChoice, pressed && styles.pressed]}
            >
              <AppText variant="small" color={active ? colors.surface : colors.green} style={styles.choiceText}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm
  },
  label: {
    fontWeight: "800"
  },
  row: {
    flexDirection: "row",
    gap: spacing.xs,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted
  },
  choice: {
    flex: 1,
    minHeight: 38,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  activeChoice: {
    backgroundColor: colors.green
  },
  pressed: {
    opacity: 0.8
  },
  choiceText: {
    fontWeight: "900"
  }
});
