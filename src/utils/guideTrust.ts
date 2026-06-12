import { ServiceGuide } from "@/types";

const dayMs = 1000 * 60 * 60 * 24;

export function getGuideFreshness(guide: ServiceGuide, now = new Date()) {
  if (guide.verificationStatus === "outdated") {
    return { label: "Outdated", tone: "danger" as const, daysSinceVerified: getDaysSince(guide.lastVerifiedAt, now) };
  }

  if (guide.expiresReviewAt && new Date(guide.expiresReviewAt).getTime() <= now.getTime()) {
    return { label: "Needs review", tone: "warning" as const, daysSinceVerified: getDaysSince(guide.lastVerifiedAt, now) };
  }

  const daysSinceVerified = getDaysSince(guide.lastVerifiedAt, now);
  if (daysSinceVerified > 120 || guide.verificationStatus === "needs_review") {
    return { label: "Needs review", tone: "warning" as const, daysSinceVerified };
  }

  if (daysSinceVerified > 75) {
    return { label: "Review soon", tone: "neutral" as const, daysSinceVerified };
  }

  return { label: "Verified", tone: "success" as const, daysSinceVerified };
}

export function getRegionNote(guide: ServiceGuide, region?: string, city?: string) {
  if (!guide.regionNotes?.length) {
    return undefined;
  }

  return (
    guide.regionNotes.find((note) => note.city && city && note.city.toLowerCase() === city.toLowerCase()) ??
    guide.regionNotes.find((note) => region && note.region.toLowerCase() === region.toLowerCase())
  );
}

export function getGuideSourceConfidence(guide: ServiceGuide, now = new Date()) {
  const checks = [
    guide.officialUrl?.startsWith("https://"),
    Boolean(guide.officialSourceRefs?.length),
    guide.requiredDocuments.every((document) => document.officialSourceUrl?.startsWith("https://")),
    guide.steps.every((step) => step.officialSourceUrl?.startsWith("https://")),
    Boolean(guide.sourceLastCheckedBy),
    Boolean(guide.reviewerNotes),
    Boolean(guide.changeSummaryEn || guide.changeSummarySw),
    getGuideFreshness(guide, now).label === "Verified"
  ];
  const passed = checks.filter(Boolean).length;
  const score = Math.round((passed / checks.length) * 100);

  return {
    score,
    label: score >= 85 ? "High confidence" : score >= 65 ? "Needs reviewer check" : "Low confidence",
    passed,
    total: checks.length
  };
}

function getDaysSince(value: string, now: Date) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(0, Math.floor((now.getTime() - time) / dayMs));
}
