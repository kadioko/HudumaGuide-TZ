import { StyleSheet, View } from "react-native";
import { spacing } from "@/constants/theme";
import { AppText } from "./AppText";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.header}>
      <AppText variant="h2">{title}</AppText>
      {subtitle ? <AppText muted>{subtitle}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs
  }
});
