import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ColorValue } from "react-native";
import { colors } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: IconName) {
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} size={size} color={color} />;
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
          minHeight: 66,
          paddingTop: 6,
          paddingBottom: 8
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700"
        },
        headerShown: false
      }}
    >
      <Tabs.Screen name="home" options={{ title: language === "sw" ? "Nyumbani" : "Home", tabBarIcon: tabIcon("home-outline") }} />
      <Tabs.Screen name="services" options={{ title: language === "sw" ? "Huduma" : "Services", tabBarIcon: tabIcon("search-outline") }} />
      <Tabs.Screen name="biashara" options={{ title: language === "sw" ? "Biashara" : "Business", tabBarIcon: tabIcon("briefcase-outline") }} />
      <Tabs.Screen name="documents" options={{ title: language === "sw" ? "Nyaraka" : "Documents", tabBarIcon: tabIcon("folder-open-outline") }} />
      <Tabs.Screen name="reminders" options={{ title: language === "sw" ? "Reminders" : "Reminders", tabBarIcon: tabIcon("alarm-outline") }} />
      <Tabs.Screen name="profile" options={{ title: language === "sw" ? "Profile" : "Profile", tabBarIcon: tabIcon("person-outline") }} />
      <Tabs.Screen name="error" options={{ href: null }} />
    </Tabs>
  );
}
