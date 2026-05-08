import { Platform } from "react-native";

export const colors = {
  background: "#F7FAF8",
  surface: "#FFFFFF",
  surfaceMuted: "#EEF6F1",
  text: "#17231E",
  textMuted: "#607068",
  border: "#DCE8E0",
  green: "#0A7A55",
  greenDark: "#075F43",
  blue: "#1769AA",
  gold: "#D99A16",
  red: "#B42318",
  success: "#168354",
  warning: "#B7791F",
  shadow: "rgba(15, 45, 32, 0.08)"
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999
};

export const typography = {
  title: 28,
  h1: 24,
  h2: 20,
  h3: 17,
  body: 15,
  small: 13,
  tiny: 11
};

export const shadow = {
  ...Platform.select({
    web: {
      boxShadow: "0 8px 18px rgba(15, 45, 32, 0.08)"
    },
    default: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 18,
      elevation: 2
    }
  })
};
