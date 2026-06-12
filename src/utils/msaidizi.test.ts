import { describe, expect, it } from "vitest";
import { buildMsaidiziAuditLog } from "@/services/msaidiziService";
import { answerFromGuideList } from "@/utils/msaidizi";
import { ServiceGuide } from "@/types";

const guide: ServiceGuide = {
  id: "svc-nida",
  slug: "nida",
  categoryId: "identity",
  titleSw: "NIDA",
  titleEn: "NIDA",
  summarySw: "Mwongozo wa NIDA",
  summaryEn: "NIDA guide",
  whoNeedsItSw: "Raia",
  whoNeedsItEn: "Citizens",
  estimatedTime: "Varies",
  estimatedCostNote: "Confirm official fees",
  officialUrl: "https://example.com",
  physicalLocationNote: "Confirm office",
  complexity: "Medium",
  keywords: ["nida"],
  requiredDocuments: [{ id: "birth", titleSw: "Cheti cha kuzaliwa", titleEn: "Birth certificate" }],
  steps: [{ id: "apply", titleSw: "Omba", titleEn: "Apply", descriptionSw: "Omba", descriptionEn: "Apply" }],
  commonMistakesSw: [],
  commonMistakesEn: [],
  faqs: [],
  lastVerifiedAt: "2026-06-01",
  disclaimer: "Confirm through official sources.",
  published: true
};

describe("Msaidizi safety", () => {
  it("returns citations for grounded approved guide answers", () => {
    const answer = answerFromGuideList("How do I get NIDA?", "en", [guide]);

    expect(answer.confidence).toBe("grounded");
    expect(answer.citations).toEqual([{ slug: "nida", title: "NIDA", lastVerifiedAt: "2026-06-01" }]);
    expect(answer.text).toContain("approved HudumaGuide TZ guide content");
  });

  it("falls back without citations when no approved guide is available", () => {
    const answer = answerFromGuideList("?", "en", []);

    expect(answer.confidence).toBe("fallback");
    expect(answer.guides).toEqual([]);
    expect(answer.citations).toEqual([]);
  });

  it("builds audit logs without raw question text", () => {
    const answer = answerFromGuideList("How do I get NIDA?", "en", [guide]);
    const auditLog = buildMsaidiziAuditLog("My private NIDA question", answer, "user-1");

    expect(auditLog).toMatchObject({
      user_id: "user-1",
      question_length: "My private NIDA question".length,
      confidence: "grounded",
      matched_guide_slugs: ["nida"],
      fallback_used: false
    });
    expect(JSON.stringify(auditLog)).not.toContain("My private NIDA question");
    expect(auditLog.question_hash).toMatch(/^q_\d+$/);
  });
});
