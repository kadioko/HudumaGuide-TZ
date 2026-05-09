import { serviceCategories } from "@/data/serviceCategories";
import { serviceGuides } from "@/data/serviceGuides";
import { ServiceGuide } from "@/types";

const aliases: Record<string, string[]> = {
  nida: ["nin", "kitambulisho", "id", "utambulisho", "kitambulisho cha taifa"],
  nin: ["nida", "kitambulisho", "utambulisho"],
  kitambulisho: ["nida", "nin", "national id"],
  tin: ["tra", "kodi", "tax", "mlipa kodi"],
  tra: ["tin", "kodi", "tax", "returns"],
  passport: ["pasipoti", "uhamiaji", "immigration"],
  pasipoti: ["passport", "uhamiaji", "immigration"],
  licence: ["license", "leseni", "permit"],
  leseni: ["licence", "license", "permit"],
  business: ["biashara", "brela", "kampuni", "company"],
  biashara: ["business", "brela", "kampuni", "company"],
  brela: ["business", "biashara", "company", "kampuni"],
  birth: ["cheti", "kuzaliwa", "birth certificate"],
  cheti: ["certificate", "birth", "kuzaliwa"],
  tax: ["kodi", "tra", "returns", "deadline"],
  kodi: ["tax", "tra", "returns", "deadline"],
  land: ["ardhi", "title", "property"],
  ardhi: ["land", "title", "property"]
};

export const searchSuggestions = ["NIDA", "TIN", "TRA", "Passport", "Leseni", "BRELA", "Cheti cha kuzaliwa", "Kodi"];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function getGuideHaystack(guide: ServiceGuide) {
  const category = serviceCategories.find((item) => item.id === guide.categoryId);

  return normalize(
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
}

function distanceWithinOne(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) {
    return false;
  }

  if (a === b) {
    return true;
  }

  let edits = 0;
  let left = 0;
  let right = 0;

  while (left < a.length && right < b.length) {
    if (a[left] === b[right]) {
      left += 1;
      right += 1;
      continue;
    }

    edits += 1;
    if (edits > 1) {
      return false;
    }

    if (a.length > b.length) {
      left += 1;
    } else if (b.length > a.length) {
      right += 1;
    } else {
      left += 1;
      right += 1;
    }
  }

  return true;
}

function hasLooseTermMatch(haystackTerms: string[], term: string) {
  if (term.length < 4) {
    return false;
  }

  return haystackTerms.some((item) => item.length >= 4 && distanceWithinOne(item, term));
}

function scoreGuide(guide: ServiceGuide, terms: string[]) {
  if (!terms.length) {
    return 1;
  }

  const title = normalize(`${guide.titleSw} ${guide.titleEn}`);
  const keywords = normalize(guide.keywords.join(" "));
  const haystack = getGuideHaystack(guide);
  const haystackTerms = haystack.split(" ");

  return terms.reduce((score, rawTerm) => {
    const term = normalize(rawTerm);

    if (!term) {
      return score;
    }

    if (title.includes(term)) {
      return score + 8;
    }

    if (keywords.includes(term)) {
      return score + 6;
    }

    if (haystack.includes(term)) {
      return score + 3;
    }

    if (hasLooseTermMatch(haystackTerms, term)) {
      return score + 1;
    }

    return score;
  }, 0);
}

export function searchGuides(query: string, categoryId?: string): ServiceGuide[] {
  const cleanQuery = normalize(query);
  const terms = cleanQuery
    ? Array.from(new Set(cleanQuery.split(" ").flatMap((term) => [term, ...(aliases[term] ?? [])])))
    : [];

  return serviceGuides
    .map((guide) => ({ guide, score: scoreGuide(guide, terms) }))
    .filter(({ guide, score }) => {
      const categoryMatches = !categoryId || guide.categoryId === categoryId;
      const queryMatches = terms.length === 0 || score > 0;

      return categoryMatches && queryMatches;
    })
    .sort((a, b) => b.score - a.score || a.guide.titleEn.localeCompare(b.guide.titleEn))
    .map(({ guide }) => guide);
}

export function getGuideBySlug(slug?: string | string[]) {
  const normalizedSlug = Array.isArray(slug) ? slug[0] : slug;
  return serviceGuides.find((guide) => guide.slug === normalizedSlug);
}
