import { ServiceGuide } from "@/types";

export function getGuideChecklistItemIds(guide: ServiceGuide) {
  return [
    ...guide.requiredDocuments.map((document) => `doc-${document.id}`),
    ...guide.steps.map((step) => `step-${step.id}`)
  ];
}

export function getGuideProgress(guide: ServiceGuide, completedItemIds: string[] = []) {
  const itemIds = getGuideChecklistItemIds(guide);
  const completed = itemIds.filter((id) => completedItemIds.includes(id)).length;
  const total = itemIds.length;

  return {
    completed,
    total,
    score: total ? Math.round((completed / total) * 100) : 0
  };
}
