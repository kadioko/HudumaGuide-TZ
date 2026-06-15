import { Platform } from "react-native";

export const colors = {
  background: "#F6FAF7",
  surface: "#FFFFFF",
  surfaceMuted: "#EEF7F2",
  surfaceStrong: "#E4F1EA",
  text: "#17231E",
  textMuted: "#607068",
  textSubtle: "#7A8A82",
  border: "#DCE8E0",
  borderStrong: "#C9DAD1",
  green: "#0A7A55",
  greenDark: "#075F43",
  greenSoft: "#DDF3EA",
  blue: "#1769AA",
  blueSoft: "#E7F1FA",
  gold: "#D99A16",
  goldSoft: "#FFF2D8",
  red: "#B42318",
  redSoft: "#FDE8E6",
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
  md: 8,
  lg: 10,
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
      boxShadow: "0 8px 20px rgba(15, 45, 32, 0.06)"
    },
    default: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 16,
      elevation: 2
    }
  })
};
