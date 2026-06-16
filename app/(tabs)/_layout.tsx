import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ColorValue, Platform, StyleSheet, View } from "react-native";
import { colors, radii, spacing } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: IconName) {
  function TabIcon({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) {
    return (
      <View style={[styles.iconShell, focused && styles.iconShellActive]}>
        <Ionicons name={name} size={Math.min(size, 22)} color={color} />
      </View>
    );
  }

  TabIcon.displayName = `TabIcon(${name})`;
  return TabIcon;
}

export default function TabsLayout() {
  const language = useAppStore((state) => state.language);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          minHeight: 72,
          paddingTop: 8,
          paddingBottom: 10
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800"
        },
        headerShown: false
      }}
    >
      <Tabs.Screen name="home" options={{ title: language === "sw" ? "Nyumbani" : "Home", tabBarIcon: tabIcon("home-outline") }} />
      <Tabs.Screen name="services" options={{ title: language === "sw" ? "Huduma" : "Services", tabBarIcon: tabIcon("search-outline") }} />
      <Tabs.Screen name="biashara" options={{ title: language === "sw" ? "Biashara" : "Business", tabBarIcon: tabIcon("briefcase-outline") }} />
      <Tabs.Screen name="documents" options={{ title: language === "sw" ? "Nyaraka" : "Vault", tabBarIcon: tabIcon("folder-open-outline") }} />
      <Tabs.Screen
        name="profile"
        options={{ title: language === "sw" ? "Wasifu" : "Profile", tabBarIcon: tabIcon("person-outline") }}
        listeners={{
          tabPress: (event) => {
            if (Platform.OS === "web" && typeof window !== "undefined") {
              event.preventDefault();
              window.location.assign("/profile");
            }
          }
        }}
      />
      <Tabs.Screen name="reminders" options={{ href: null }} />
      <Tabs.Screen name="error" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconShell: {
    minWidth: 36,
    minHeight: 26,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm
  },
  iconShellActive: {
    backgroundColor: colors.greenSoft
  }
});
