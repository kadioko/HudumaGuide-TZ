import { serviceGuides } from "@/data/serviceGuides";

export function validateServiceGuides() {
  const slugs = new Set<string>();
  const issues: string[] = [];

  for (const guide of serviceGuides) {
    if (slugs.has(guide.slug)) {
      issues.push(`${guide.slug}: duplicate slug`);
    }
    slugs.add(guide.slug);

    if (!guide.titleEn || !guide.titleSw) {
      issues.push(`${guide.slug}: missing bilingual title`);
    }

    if (!guide.summaryEn || !guide.summarySw || !guide.whoNeedsItEn || !guide.whoNeedsItSw) {
      issues.push(`${guide.slug}: missing bilingual guide summary or audience copy`);
    }

    if (!guide.disclaimer.includes("Confirm")) {
      issues.push(`${guide.slug}: disclaimer must direct users to confirm official sources`);
    }

    if (!guide.officialUrl?.startsWith("https://")) {
      issues.push(`${guide.slug}: officialUrl must be HTTPS`);
    }

    if (!guide.officialSourceRefs?.length) {
      issues.push(`${guide.slug}: must include officialSourceRefs`);
    }

    if (!guide.expiresReviewAt) {
      issues.push(`${guide.slug}: must include review expiry`);
    }

    if (!guide.lastVerifiedAt) {
      issues.push(`${guide.slug}: must include last verified date`);
    }

    for (const document of guide.requiredDocuments) {
      if (!document.titleEn || !document.titleSw) {
        issues.push(`${guide.slug}/${document.id}: document must include bilingual title`);
      }
      if (!document.officialSourceUrl?.startsWith("https://")) {
        issues.push(`${guide.slug}/${document.id}: document must include HTTPS officialSourceUrl`);
      }
    }

    for (const step of guide.steps) {
      if (!step.titleEn || !step.titleSw || !step.descriptionEn || !step.descriptionSw) {
        issues.push(`${guide.slug}/${step.id}: step must include bilingual title and description`);
      }
      if (!step.officialSourceUrl?.startsWith("https://")) {
        issues.push(`${guide.slug}/${step.id}: step must include HTTPS officialSourceUrl`);
      }
    }

    if (!guide.requiredDocuments.length || !guide.steps.length) {
      issues.push(`${guide.slug}: must include documents and steps`);
    }
  }

  return issues;
}
