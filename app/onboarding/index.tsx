import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { Screen } from "@/components/Screen";
import { colors, radii, spacing } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { Language, OnboardingPersona } from "@/types";

const slides = [
  {
    icon: "compass-outline" as const,
    titleSw: "Huduma za Serikali kwa urahisi",
    titleEn: "Government services made simpler",
    bodySw: "Pata maelekezo, checklist, na viungo rasmi bila kuchanganyikiwa.",
    bodyEn: "Find steps, checklists, and official links without getting lost."
  },
  {
    icon: "briefcase-outline" as const,
    titleSw: "Anzisha biashara yako kwa mpangilio",
    titleEn: "Set up your business with a plan",
    bodySw: "Fuata hatua za BRELA, TRA, leseni na kumbukumbu muhimu kwa urahisi.",
    bodyEn: "Follow BRELA, TRA, licence, and compliance steps in one place."
  },
  {
    icon: "alarm-outline" as const,
    titleSw: "Hifadhi checklist na reminders",
    titleEn: "Save checklists and reminders",
    bodySw: "Usisahau renewal, deadline au nyaraka muhimu tena.",
    bodyEn: "Keep renewal dates, deadlines, and important document follow-ups close."
  }
];

const personas: { value: OnboardingPersona; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "citizen", label: "Citizen", icon: "person-outline" },
  { value: "student", label: "Student", icon: "school-outline" },
  { value: "business_owner", label: "Business owner", icon: "briefcase-outline" },
  { value: "driver", label: "Driver", icon: "car-outline" },
  { value: "family_admin", label: "Family admin", icon: "people-outline" }
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const [persona, setPersona] = useState<OnboardingPersona>("citizen");
  const [hasChosenLanguage, setHasChosenLanguage] = useState(false);
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const slide = slides[index];
  const isLast = index === slides.length - 1;
  const finish = () => {
    completeOnboarding(persona);
    router.replace("/(tabs)/home");
  };

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <View style={styles.brand}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} />
          <View>
            <AppText variant="h2">HudumaGuide TZ</AppText>
            <AppText muted>
              {language === "sw" ? "Huduma za Serikali na Biashara kwa urahisi." : "Government and business services made simpler."}
            </AppText>
          </View>
        </View>

        {!hasChosenLanguage ? (
          <>
            <AppCard style={styles.slide}>
              <View style={styles.heroIcon}>
                <Ionicons name="language-outline" size={48} color={colors.green} />
              </View>
              <AppText variant="title" style={styles.center}>
                Chagua lugha / Choose language
              </AppText>
              <AppText muted style={styles.center}>
                Unaweza kubadilisha lugha baadaye kwenye Profile.
                {"\n"}
                You can change this later in Profile.
              </AppText>
              <View style={styles.languageChoices}>
                {[
                  { value: "sw" as Language, title: "Kiswahili", subtitle: "Endelea kwa Kiswahili" },
                  { value: "en" as Language, title: "English", subtitle: "Continue in English" }
                ].map((item) => (
                  <Pressable
                    key={item.value}
                    accessibilityRole="button"
                    accessibilityLabel={item.title}
                    accessibilityState={{ selected: language === item.value }}
                    onPress={() => {
                      setLanguage(item.value);
                      setHasChosenLanguage(true);
                      setIndex(0);
                    }}
                    style={({ pressed }) => [styles.languageChoice, language === item.value && styles.languageChoiceActive, pressed && styles.pressed]}
                  >
                    <Ionicons name={item.value === "sw" ? "chatbubble-ellipses-outline" : "globe-outline"} size={22} color={language === item.value ? colors.surface : colors.green} />
                    <View style={styles.flex}>
                      <AppText variant="h3" color={language === item.value ? colors.surface : colors.text}>
                        {item.title}
                      </AppText>
                      <AppText variant="small" color={language === item.value ? colors.surface : colors.textMuted}>
                        {item.subtitle}
                      </AppText>
                    </View>
                  </Pressable>
                ))}
              </View>
            </AppCard>
          </>
        ) : (
          <>
        <AppCard style={styles.slide}>
          <View style={styles.heroIcon}>
            <Ionicons name={slide.icon} size={48} color={colors.green} />
          </View>
          <AppText variant="title" style={styles.center}>
            {language === "sw" ? slide.titleSw : slide.titleEn}
          </AppText>
          <AppText muted style={styles.center}>
            {language === "sw" ? slide.bodySw : slide.bodyEn}
          </AppText>
        </AppCard>

        {isLast ? (
          <View style={styles.personas}>
            {personas.map((item) => (
              <Pressable
                key={item.value}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: persona === item.value }}
                onPress={() => setPersona(item.value)}
                style={[styles.persona, persona === item.value && styles.personaActive]}
              >
                <Ionicons name={item.icon} size={18} color={persona === item.value ? colors.surface : colors.green} />
                <AppText variant="small" color={persona === item.value ? colors.surface : colors.text} style={styles.personaText}>
                  {item.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.dots}>
          {slides.map((item, slideIndex) => (
            <Pressable
              key={item.titleEn}
              accessibilityRole="button"
              accessibilityLabel={`Slide ${slideIndex + 1}`}
              onPress={() => setIndex(slideIndex)}
              style={[styles.dot, index === slideIndex && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <AppButton
            title={isLast ? (language === "sw" ? "Anza sasa" : "Start now") : language === "sw" ? "Endelea" : "Continue"}
            icon={isLast ? "arrow-forward-outline" : "chevron-forward-outline"}
            onPress={() => (isLast ? finish() : setIndex(index + 1))}
          />
          <AppButton title={language === "sw" ? "Ruka" : "Skip"} variant="ghost" onPress={finish} />
        </View>
          </>
        )}
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
    borderRadius: radii.md
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
    borderRadius: radii.lg,
    backgroundColor: colors.greenSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  center: {
    textAlign: "center"
  },
  flex: {
    flex: 1
  },
  languageChoices: {
    alignSelf: "stretch",
    gap: spacing.sm
  },
  languageChoice: {
    minHeight: 74,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  languageChoiceActive: {
    backgroundColor: colors.green,
    borderColor: colors.green
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }]
  },
  personas: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  persona: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  personaActive: {
    backgroundColor: colors.green,
    borderColor: colors.green
  },
  personaText: {
    fontWeight: "800"
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
