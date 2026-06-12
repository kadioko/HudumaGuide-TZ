import { StyleSheet, View } from "react-native";
import { spacing } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { AppButton } from "./AppButton";
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
        <AppButton
          title="Kiswahili"
          variant={language === "sw" ? "primary" : "secondary"}
          onPress={() => setLanguage("sw")}
          style={styles.choice}
        />
        <AppButton
          title="English"
          variant={language === "en" ? "primary" : "secondary"}
          onPress={() => setLanguage("en")}
          style={styles.choice}
        />
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
    gap: spacing.sm
  },
  choice: {
    flex: 1
  }
});
