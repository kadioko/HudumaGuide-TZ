import { StyleSheet, View } from "react-native";
import { colors, radii } from "@/constants/theme";

type ProgressBarProps = {
  value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  const normalized = Math.max(0, Math.min(100, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: normalized }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${normalized}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 9,
    backgroundColor: colors.border,
    borderRadius: radii.pill,
    overflow: "hidden"
  },
  fill: {
    height: "100%",
    backgroundColor: colors.green
  }
});
