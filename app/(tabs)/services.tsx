import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/AppText";
import { EmptyState } from "@/components/EmptyState";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { ServiceCard } from "@/components/ServiceCard";
import { TextField } from "@/components/TextField";
import { colors, radii, spacing } from "@/constants/theme";
import { serviceCategories } from "@/data/serviceCategories";
import { useAppStore } from "@/store/useAppStore";
import { searchGuides, searchSuggestions } from "@/utils/search";

export default function ServicesScreen() {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const language = useAppStore((state) => state.language);
  const results = useMemo(() => searchGuides(query, categoryId), [query, categoryId]);

  return (
    <Screen>
      <SectionHeader
        title={language === "sw" ? "HudumaGuide TZ" : "Government Services"}
        subtitle={language === "sw" ? "Tafuta huduma kwa Kiswahili au English." : "Search in Swahili or English."}
      />
      <TextField
        value={query}
        onChangeText={setQuery}
        placeholder="NIDA, TIN, leseni, cheti, BRELA..."
        accessibilityLabel="Search service guides"
      />
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
        <AppText variant="small" muted>
          {language === "sw" ? `${results.length} guide zimepatikana` : `${results.length} guides found`}
        </AppText>
        {results.length ? (
          results.map((guide) => <ServiceCard key={guide.id} guide={guide} language={language} />)
        ) : (
          <EmptyState
            icon="search-outline"
            title={language === "sw" ? "Hakuna matokeo" : "No results"}
            body={language === "sw" ? "Jaribu neno kama NIDA, TIN, leseni au BRELA." : "Try NIDA, TIN, licence, or BRELA."}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  }
});
