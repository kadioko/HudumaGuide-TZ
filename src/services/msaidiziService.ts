import { supabase } from "@/lib/supabase";
import { Language, ServiceGuide } from "@/types";
import { answerFromApprovedGuides, answerFromGuideList, MsaidiziAnswer } from "@/utils/msaidizi";
import { searchGuides } from "@/utils/search";

type RemoteGuideRow = {
  slug: string;
  category_id: string;
  title_en: string;
  title_sw: string;
  summary_en: string;
  summary_sw: string;
  who_needs_it_en: string | null;
  who_needs_it_sw: string | null;
  estimated_time: string | null;
  estimated_cost_note: string;
  official_url: string;
  physical_location_note: string | null;
  search_keywords: string[];
  required_documents: { id?: string; title_en?: string; title_sw?: string }[];
  steps: { id?: string; title_en?: string; title_sw?: string; description_en?: string; description_sw?: string }[];
  common_mistakes: string[];
  faqs: { question_en?: string; question_sw?: string; answer_en?: string; answer_sw?: string }[];
  last_verified_at: string | null;
  disclaimer: string;
};

export async function answerMsaidizi(question: string, language: Language, userId?: string): Promise<MsaidiziAnswer> {
  const localAnswer = answerFromApprovedGuides(question, language);

  if (!supabase) {
    await auditMsaidizi(question, localAnswer, userId);
    return localAnswer;
  }

  try {
    const candidateSlugs = searchGuides(question).slice(0, 5).map((guide) => guide.slug);
    if (!candidateSlugs.length) {
      await auditMsaidizi(question, localAnswer, userId);
      return localAnswer;
    }

    const { data, error } = await supabase
      .from("service_guides")
      .select(
        "slug, category_id, title_en, title_sw, summary_en, summary_sw, who_needs_it_en, who_needs_it_sw, estimated_time, estimated_cost_note, official_url, physical_location_note, search_keywords, required_documents, steps, common_mistakes, faqs, last_verified_at, disclaimer"
      )
      .eq("published", true)
      .eq("msaidizi_enabled", true)
      .in("slug", candidateSlugs);

    if (error || !data?.length) {
      await auditMsaidizi(question, localAnswer, userId);
      return localAnswer;
    }

    const remoteGuides = (data as RemoteGuideRow[]).map(mapRemoteGuide).slice(0, 3);
    const answer = answerFromGuideList(question, language, remoteGuides);
    await auditMsaidizi(question, answer, userId);
    return answer;
  } catch {
    await auditMsaidizi(question, localAnswer, userId);
    return localAnswer;
  }
}

async function auditMsaidizi(question: string, answer: MsaidiziAnswer, userId?: string) {
  if (!supabase) {
    return;
  }

  await supabase.from("msaidizi_audit_logs").insert({
    user_id: userId ?? null,
    question_hash: hashQuestion(question),
    question_length: question.trim().length,
    confidence: answer.confidence,
    matched_guide_slugs: answer.guides.map((guide) => guide.slug),
    fallback_used: answer.confidence === "fallback"
  });
}

function mapRemoteGuide(row: RemoteGuideRow): ServiceGuide {
  return {
    id: row.slug,
    slug: row.slug,
    categoryId: row.category_id,
    titleEn: row.title_en,
    titleSw: row.title_sw,
    summaryEn: row.summary_en,
    summarySw: row.summary_sw,
    whoNeedsItEn: row.who_needs_it_en ?? row.summary_en,
    whoNeedsItSw: row.who_needs_it_sw ?? row.summary_sw,
    estimatedTime: row.estimated_time ?? "Varies. Confirm with official source.",
    estimatedCostNote: row.estimated_cost_note,
    officialUrl: row.official_url,
    physicalLocationNote: row.physical_location_note ?? "Confirm through the official office or portal.",
    complexity: "Medium",
    keywords: row.search_keywords ?? [],
    requiredDocuments: (row.required_documents ?? []).map((document, index) => ({
      id: document.id ?? `doc-${index}`,
      titleEn: document.title_en ?? "Confirm required document",
      titleSw: document.title_sw ?? "Hakiki nyaraka inayohitajika"
    })),
    steps: (row.steps ?? []).map((step, index) => ({
      id: step.id ?? `step-${index}`,
      titleEn: step.title_en ?? "Confirm official step",
      titleSw: step.title_sw ?? "Hakiki hatua rasmi",
      descriptionEn: step.description_en ?? "Confirm through official source.",
      descriptionSw: step.description_sw ?? "Hakiki kupitia chanzo rasmi."
    })),
    commonMistakesEn: row.common_mistakes ?? [],
    commonMistakesSw: row.common_mistakes ?? [],
    faqs: (row.faqs ?? []).map((faq) => ({
      questionEn: faq.question_en ?? "",
      questionSw: faq.question_sw ?? "",
      answerEn: faq.answer_en ?? "",
      answerSw: faq.answer_sw ?? ""
    })),
    lastVerifiedAt: row.last_verified_at ?? "",
    disclaimer: row.disclaimer,
    published: true
  };
}

function hashQuestion(question: string) {
  const normalized = question.toLowerCase().trim();
  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash << 5) - hash + normalized.charCodeAt(index);
    hash |= 0;
  }

  return `q_${Math.abs(hash)}`;
}
