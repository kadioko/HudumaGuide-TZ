import { serviceCategories } from "@/data/serviceCategories";
import { Language, ServiceGuide } from "@/types";
import { legalTaxNotice, pick, trustNotice } from "@/utils/copy";
import { searchGuides } from "@/utils/search";

export const msaidiziFallback =
  "Sina uhakika. Tafadhali hakiki kupitia tovuti rasmi au ofisi husika.";

export type MsaidiziAnswer = {
  text: string;
  guides: ServiceGuide[];
  citations: { slug: string; title: string; lastVerifiedAt?: string }[];
  confidence: "grounded" | "fallback";
};

function makeGuideSummary(guide: ServiceGuide, language: Language) {
  const documents = guide.requiredDocuments
    .slice(0, 3)
    .map((document) => pick(language, document.titleSw, document.titleEn))
    .join(", ");
  const steps = guide.steps
    .slice(0, 3)
    .map((step, index) => `${index + 1}. ${pick(language, step.titleSw, step.titleEn)}`)
    .join("\n");
  const category = serviceCategories.find((item) => item.id === guide.categoryId);

  if (language === "sw") {
    return [
      `${pick(language, guide.titleSw, guide.titleEn)} (${pick(language, category?.titleSw ?? "", category?.titleEn ?? "")})`,
      pick(language, guide.summarySw, guide.summaryEn),
      `Nyaraka muhimu: ${documents || "Hakiki kwenye guide."}`,
      `Hatua za mwanzo:\n${steps}`,
      `Muda: ${guide.estimatedTime}`,
      `Gharama: ${guide.estimatedCostNote}`
    ].join("\n\n");
  }

  return [
    `${pick(language, guide.titleSw, guide.titleEn)} (${pick(language, category?.titleSw ?? "", category?.titleEn ?? "")})`,
    pick(language, guide.summarySw, guide.summaryEn),
    `Key documents: ${documents || "Confirm in the guide."}`,
    `First steps:\n${steps}`,
    `Timeline: ${guide.estimatedTime}`,
    `Cost: ${guide.estimatedCostNote}`
  ].join("\n\n");
}

export function answerFromGuideList(question: string, language: Language, guides: ServiceGuide[]): MsaidiziAnswer {
  const cleanQuestion = question.trim();

  if (cleanQuestion.length < 2) {
    return {
      text: language === "sw" ? msaidiziFallback : "I am not sure. Please confirm through the official portal or relevant office.",
      guides: [],
      citations: [],
      confidence: "fallback"
    };
  }

  if (!guides.length) {
    return {
      text: language === "sw" ? msaidiziFallback : "I am not sure. Please confirm through the official portal or relevant office.",
      guides: [],
      citations: [],
      confidence: "fallback"
    };
  }

  const intro =
    language === "sw"
      ? "Nimepata majibu haya kutoka kwenye guide zilizopo ndani ya HudumaGuide TZ:"
      : "I found this from approved HudumaGuide TZ guide content:";
  const body = guides.map((guide) => makeGuideSummary(guide, language)).join("\n\n---\n\n");
  const footer = language === "sw" ? `${trustNotice}\n${legalTaxNotice}` : `${trustNotice}\n${legalTaxNotice}`;

  return {
    text: `${intro}\n\n${body}\n\n${footer}`,
    guides,
    citations: guides.map((guide) => ({
      slug: guide.slug,
      title: pick(language, guide.titleSw, guide.titleEn),
      lastVerifiedAt: guide.lastVerifiedAt
    })),
    confidence: "grounded"
  };
}

export function answerFromApprovedGuides(question: string, language: Language): MsaidiziAnswer {
  return answerFromGuideList(question, language, searchGuides(question).slice(0, 3));
}
