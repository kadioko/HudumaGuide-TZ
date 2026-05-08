import { router, useLocalSearchParams } from "expo-router";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { ChecklistRow } from "@/components/ChecklistRow";
import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { useAppStore } from "@/store/useAppStore";
import { pick } from "@/utils/copy";
import { getGuideBySlug } from "@/utils/search";

const emptyChecklistItems: string[] = [];

export default function ServiceChecklistScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const guide = getGuideBySlug(slug);
  const language = useAppStore((state) => state.language);
  const checklistItems = useAppStore((state) => state.checklistItemsByGuide[slug ?? ""] ?? emptyChecklistItems);
  const toggleChecklistItem = useAppStore((state) => state.toggleChecklistItem);

  if (!guide) {
    return (
      <Screen>
        <AppCard>
          <AppText variant="h2">Checklist not found</AppText>
          <AppButton title="Back" onPress={() => router.back()} />
        </AppCard>
      </Screen>
    );
  }

  const items = [
    ...guide.requiredDocuments.map((document) => ({
      id: `doc-${document.id}`,
      title: pick(language, document.titleSw, document.titleEn),
      description: pick(language, document.noteSw ?? "", document.noteEn ?? "")
    })),
    ...guide.steps.map((step, index) => ({
      id: `step-${step.id}`,
      title: `${language === "sw" ? "Hatua ya" : "Step"} ${index + 1}: ${pick(language, step.titleSw, step.titleEn)}`,
      description: pick(language, step.descriptionSw, step.descriptionEn)
    }))
  ];
  const complete = items.filter((item) => checklistItems.includes(item.id)).length;
  const progress = items.length ? Math.round((complete / items.length) * 100) : 0;

  return (
    <Screen>
      <SectionHeader
        title={pick(language, guide.titleSw, guide.titleEn)}
        subtitle={language === "sw" ? `${complete}/${items.length} zimekamilika` : `${complete}/${items.length} complete`}
      />
      <ProgressBar value={progress} />
      <AppCard>
        {items.map((item) => (
          <ChecklistRow
            key={item.id}
            title={item.title}
            description={item.description || undefined}
            checked={checklistItems.includes(item.id)}
            onToggle={() => toggleChecklistItem(guide.slug, item.id)}
          />
        ))}
      </AppCard>
    </Screen>
  );
}
