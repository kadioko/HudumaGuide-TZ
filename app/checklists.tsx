import { router } from "expo-router";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { EmptyState } from "@/components/EmptyState";
import { SavedGuideCard } from "@/components/SavedGuideCard";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { serviceGuides } from "@/data/serviceGuides";
import { useAppStore } from "@/store/useAppStore";

export default function ChecklistsScreen() {
  const language = useAppStore((state) => state.language);
  const savedGuideSlugs = useAppStore((state) => state.savedGuideSlugs);
  const checklistItemsByGuide = useAppStore((state) => state.checklistItemsByGuide);
  const savedGuides = savedGuideSlugs
    .map((slug) => serviceGuides.find((guide) => guide.slug === slug))
    .filter((guide): guide is NonNullable<typeof guide> => Boolean(guide));

  return (
    <Screen>
      <SectionHeader
        title={language === "sw" ? "Saved checklists" : "Saved checklists"}
        subtitle={
          language === "sw"
            ? "Checklist zako zinahifadhiwa kwenye kifaa kwa matumizi ya low-data."
            : "Your checklists are stored on-device for low-data use."
        }
      />

      {savedGuides.length ? (
        savedGuides.map((guide) => (
          <SavedGuideCard
            key={guide.slug}
            guide={guide}
            language={language}
            completedItemIds={checklistItemsByGuide[guide.slug]}
          />
        ))
      ) : (
        <AppCard>
          <EmptyState
            icon="bookmark-outline"
            title={language === "sw" ? "Bado hakuna checklist" : "No checklists yet"}
            body={
              language === "sw"
                ? "Fungua huduma yoyote kisha hifadhi checklist ili uendelee baadaye."
                : "Open any service and save the checklist to continue later."
            }
          />
          <AppButton title={language === "sw" ? "Tafuta huduma" : "Find services"} icon="search-outline" onPress={() => router.push("/(tabs)/services")} />
        </AppCard>
      )}

      <AppCard muted>
        <AppText variant="h3">{language === "sw" ? "Offline note" : "Offline note"}</AppText>
        <AppText muted>
          {language === "sw"
            ? "Guides na checklist zilizohifadhiwa zipo kwenye kifaa hiki. Cloud sync itaongezwa Supabase Auth ikiunganishwa."
            : "Saved guides and checklist progress live on this device. Cloud sync comes after Supabase Auth is connected."}
        </AppText>
      </AppCard>
    </Screen>
  );
}
