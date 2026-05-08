import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";

const slides = [
  {
    icon: "compass-outline" as const,
    title: "Huduma za Serikali kwa urahisi",
    body: "Pata maelekezo, checklist, na viungo rasmi bila kuchanganyikiwa."
  },
  {
    icon: "briefcase-outline" as const,
    title: "Anzisha biashara yako kwa mpangilio",
    body: "Fuata hatua za BRELA, TRA, leseni na kumbukumbu muhimu kwa urahisi."
  },
  {
    icon: "alarm-outline" as const,
    title: "Hifadhi checklist na reminders",
    body: "Usisahau renewal, deadline au nyaraka muhimu tena."
  }
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const slide = slides[index];
  const isLast = index === slides.length - 1;
  const finish = () => {
    completeOnboarding();
    router.replace("/(tabs)/home");
  };

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Ionicons name="shield-checkmark-outline" size={26} color={colors.surface} />
          </View>
          <View>
            <AppText variant="h2">HudumaGuide TZ</AppText>
            <AppText muted>Huduma za Serikali na Biashara kwa urahisi.</AppText>
          </View>
        </View>

        <AppCard style={styles.slide}>
          <View style={styles.heroIcon}>
            <Ionicons name={slide.icon} size={48} color={colors.green} />
          </View>
          <AppText variant="title" style={styles.center}>
            {slide.title}
          </AppText>
          <AppText muted style={styles.center}>
            {slide.body}
          </AppText>
        </AppCard>

        <View style={styles.dots}>
          {slides.map((item, slideIndex) => (
            <Pressable
              key={item.title}
              accessibilityRole="button"
              accessibilityLabel={`Slide ${slideIndex + 1}`}
              onPress={() => setIndex(slideIndex)}
              style={[styles.dot, index === slideIndex && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <AppButton
            title={isLast ? "Anza sasa" : "Endelea"}
            icon={isLast ? "arrow-forward-outline" : "chevron-forward-outline"}
            onPress={() => (isLast ? finish() : setIndex(index + 1))}
          />
          <AppButton title="Ruka" variant="ghost" onPress={finish} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.xl,
    justifyContent: "space-between",
    paddingBottom: spacing.xl
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center"
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.lg
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center"
  },
  center: {
    textAlign: "center"
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 99,
    backgroundColor: colors.border
  },
  dotActive: {
    width: 26,
    backgroundColor: colors.green
  },
  actions: {
    gap: spacing.sm
  }
});
