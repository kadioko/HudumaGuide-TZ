import { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, TextStyle } from "react-native";
import { colors, typography } from "@/constants/theme";

type Variant = "title" | "h1" | "h2" | "h3" | "body" | "small" | "tiny";

type AppTextProps = {
  children: ReactNode;
  variant?: Variant;
  muted?: boolean;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export function AppText({ children, variant = "body", muted, color, style }: AppTextProps) {
  const textStyle: StyleProp<TextStyle> = [
    styles.base,
    styles[variant] as TextStyle,
    muted ? styles.muted : null,
    color ? { color } : null,
    style
  ];

  return (
    <Text style={textStyle}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
    lineHeight: 21
  },
  title: {
    fontSize: typography.title,
    lineHeight: 34,
    fontWeight: "800"
  },
  h1: {
    fontSize: typography.h1,
    lineHeight: 30,
    fontWeight: "800"
  },
  h2: {
    fontSize: typography.h2,
    lineHeight: 26,
    fontWeight: "700"
  },
  h3: {
    fontSize: typography.h3,
    lineHeight: 23,
    fontWeight: "700"
  },
  body: {
    fontSize: typography.body
  },
  small: {
    fontSize: typography.small,
    lineHeight: 18
  },
  tiny: {
    fontSize: typography.tiny,
    lineHeight: 15,
    fontWeight: "700"
  },
  muted: {
    color: colors.textMuted
  }
});
