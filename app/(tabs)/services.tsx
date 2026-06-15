import { useEffect, useMemo, useRef, useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { EmptyState } from "@/components/EmptyState";
import { AppButton } from "@/components/AppButton";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { ServiceCard } from "@/components/ServiceCard";
import { TextField } from "@/components/TextField";
import { colors, radii, spacing } from "@/constants/theme";
import { serviceCategories } from "@/data/serviceCategories";
import { serviceGuides } from "@/data/serviceGuides";
import { trackAnalyticsEvent } from "@/services/analyticsService";
import { useAppStore } from "@/store/useAppStore";
import { searchGuides, searchSuggestions } from "@/utils/search";

export default function ServicesScreen() {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const language = useAppStore((state) => state.language);
  const userProfile = useAppStore((state) => state.userProfile);
  const results = useMemo(() => searchGuides(query, categoryId), [query, categoryId]);
  const selectedCategory = serviceCategories.find((category) => category.id === categoryId);
  const lastTrackedQuery = useRef("");

  useEffect(() => {
    const cleanQuery = query.trim();
    if (cleanQuery.length < 2 || cleanQuery === lastTrackedQuery.current) {
      return;
    }

    const timer = setTimeout(() => {
      lastTrackedQuery.current = cleanQuery;
      void trackAnalyticsEvent(
        results.length ? "service_search" : "service_search_no_results",
        { query: cleanQuery, resultCount: results.length, categoryId, language },
        userProfile?.id
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [categoryId, language, query, results.length, userProfile?.id]);

  return (
    <Screen>
      <View style={styles.topBar}>
        <SectionHeader
          title={language === "sw" ? "Tafuta huduma" : "Find a service"}
          subtitle={language === "sw" ? "NIDA, TRA, BRELA, RITA, leseni na zaidi." : "NIDA, TRA, BRELA, RITA, licences, and more."}
        />
        <LanguageToggle compact />
      </View>

      <AppCard style={styles.searchPanel}>
        <View style={styles.searchHeader}>
          <View style={styles.searchIcon}>
            <Ionicons name="search-outline" size={21} color={colors.green} />
          </View>
          <View style={styles.searchCopy}>
            <AppText variant="h3">{language === "sw" ? "Unafuatilia nini leo?" : "What are you sorting out today?"}</AppText>
            <AppText variant="small" muted>
              {language === "sw" ? `${serviceGuides.length} guides zipo kwa beta.` : `${serviceGuides.length} beta guides available.`}
            </AppText>
          </View>
        </View>
        <TextField
          value={query}
          onChangeText={setQuery}
          placeholder={language === "sw" ? "NIDA, TIN, leseni, cheti, BRELA..." : "NIDA, TIN, licence, certificate, BRELA..."}
          accessibilityLabel="Search service guides"
        />
      </AppCard>

      <View style={styles.suggestionRow}>
        {searchSuggestions.slice(0, 6).map((suggestion) => (
          <Pressable
            key={suggestion}
            accessibilityRole="button"
            accessibilityLabel={`${language === "sw" ? "Tafuta" : "Search"} ${suggestion}`}
            onPress={() => setQuery(suggestion)}
            style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}
          >
            <AppText variant="small" color={colors.green} style={styles.suggestionText}>
              {suggestion}
            </AppText>
          </Pressable>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        <Pill label={language === "sw" ? "Zote" : "All"} active={!categoryId} onPress={() => setCategoryId(undefined)} />
        {serviceCategories.map((category) => (
          <Pill
            key={category.id}
            label={language === "sw" ? category.titleSw : category.titleEn}
            icon={category.icon as never}
            active={categoryId === category.id}
            onPress={() => setCategoryId(category.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.results}>
        <View style={styles.resultHeader}>
          <View>
            <AppText variant="h3">{selectedCategory ? (language === "sw" ? selectedCategory.titleSw : selectedCategory.titleEn) : language === "sw" ? "Guide zote" : "All guides"}</AppText>
            <AppText variant="small" muted>
              {language === "sw" ? `${results.length} guide zimepatikana` : `${results.length} guides found`}
            </AppText>
          </View>
          {query || categoryId ? (
            <AppButton title={language === "sw" ? "Futa" : "Clear"} variant="ghost" onPress={() => { setQuery(""); setCategoryId(undefined); }} />
          ) : null}
        </View>
        {results.length ? (
          results.map((guide) => <ServiceCard key={guide.id} guide={guide} language={language} />)
        ) : (
          <>
            <EmptyState
              icon="search-outline"
              title={language === "sw" ? "Hakuna matokeo" : "No results"}
              body={language === "sw" ? "Jaribu neno kama NIDA, TIN, leseni au BRELA." : "Try NIDA, TIN, licence, or BRELA."}
            />
            {query.trim().length >= 2 ? (
              <AppButton
                title={language === "sw" ? "Pendekeza guide hii" : "Suggest this guide"}
                icon="flag-outline"
                variant="secondary"
                onPress={() => router.push({ pathname: "/feedback", params: { serviceSlug: `missing:${query.trim()}` } })}
              />
            ) : null}
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
  },
  searchPanel: {
    gap: spacing.md
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  searchIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.sm,
    backgroundColor: colors.greenSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  searchCopy: {
    flex: 1,
    gap: 2
  },
  categoryRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg
  },
  suggestionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  suggestion: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill
  },
  suggestionText: {
    fontWeight: "800"
  },
  pressed: {
    opacity: 0.72
  },
  results: {
    gap: spacing.md
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  }
});
