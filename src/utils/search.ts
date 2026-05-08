import { serviceCategories } from "@/data/serviceCategories";
import { serviceGuides } from "@/data/serviceGuides";
import { ServiceGuide } from "@/types";

const aliases: Record<string, string[]> = {
  nida: ["nin", "kitambulisho", "id", "utambulisho"],
  tin: ["tra", "kodi", "tax", "mlipa kodi"],
  passport: ["pasipoti", "uhamiaji", "immigration"],
  licence: ["license", "leseni", "permit"],
  business: ["biashara", "brela", "kampuni", "company"],
  birth: ["cheti", "kuzaliwa", "birth certificate"],
  tax: ["kodi", "tra", "returns", "deadline"],
  land: ["ardhi", "title", "property"]
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

export function searchGuides(query: string, categoryId?: string): ServiceGuide[] {
  const cleanQuery = normalize(query);
  const terms = cleanQuery
    ? Array.from(new Set(cleanQuery.split(" ").flatMap((term) => [term, ...(aliases[term] ?? [])])))
    : [];

  return serviceGuides.filter((guide) => {
    const category = serviceCategories.find((item) => item.id === guide.categoryId);
    const haystack = normalize(
      [
        guide.titleSw,
        guide.titleEn,
        guide.summarySw,
        guide.summaryEn,
        guide.whoNeedsItSw,
        guide.whoNeedsItEn,
        category?.titleSw,
        category?.titleEn,
        guide.keywords.join(" ")
      ].join(" ")
    );

    const categoryMatches = !categoryId || guide.categoryId === categoryId;
    const queryMatches = terms.length === 0 || terms.some((term) => haystack.includes(normalize(term)));

    return categoryMatches && queryMatches;
  });
}

export function getGuideBySlug(slug?: string | string[]) {
  const normalizedSlug = Array.isArray(slug) ? slug[0] : slug;
  return serviceGuides.find((guide) => guide.slug === normalizedSlug);
}
