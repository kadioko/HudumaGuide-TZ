import { describe, expect, it } from "vitest";
import { getGuideBySlug, searchGuides } from "@/utils/search";

const slugs = (query: string, categoryId?: string) => searchGuides(query, categoryId).map((guide) => guide.slug);

describe("guide search", () => {
  it("returns every guide for an empty or whitespace query", () => {
    expect(slugs("").length).toBeGreaterThan(0);
    expect(slugs("  ")).toEqual(slugs(""));
  });

  it("finds an English-titled guide from a Swahili query", () => {
    expect(slugs("kitambulisho")[0]).toBe("nida-nin-application");
    expect(slugs("pasipoti")[0]).toBe("passport-application");
  });

  it("finds a guide from a Swahili query with no shared words", () => {
    // "kodi" appears in neither title of the tax guides in English.
    expect(slugs("kodi")).toContain("tin-registration");
  });

  it("expands aliases so abbreviations reach the right guide", () => {
    expect(slugs("nin")[0]).toBe("nida-nin-application");
    expect(slugs("brela")).toContain("business-name-registration");
  });

  it("ranks title matches above body matches", () => {
    const results = slugs("passport");
    expect(results[0]).toBe("passport-application");
    expect(results.length).toBeGreaterThan(1);
  });

  it("ranks typo matches by field rather than alphabetically", () => {
    // Regression: every loose match scored the same, so ordering collapsed to
    // the alphabetical tiebreak and unrelated guides came first.
    expect(slugs("nidaa")[0]).toMatch(/^nida-/);
    expect(slugs("pasiport")[0]).toBe("passport-application");
  });

  it("tolerates a single-character typo", () => {
    expect(slugs("buiness")).toContain("business-name-registration");
  });

  it("returns nothing for a query that matches no guide", () => {
    expect(slugs("zzzzz")).toEqual([]);
  });

  it("filters by category", () => {
    const business = searchGuides("", "business");
    expect(business.length).toBeGreaterThan(0);
    for (const guide of business) {
      expect(guide.categoryId).toBe("business");
    }
  });

  it("applies the category filter alongside the query", () => {
    for (const guide of searchGuides("biashara", "tax")) {
      expect(guide.categoryId).toBe("tax");
    }
  });
});

describe("getGuideBySlug", () => {
  it("resolves a known slug", () => {
    expect(getGuideBySlug("nida-nin-application")?.slug).toBe("nida-nin-application");
  });

  it("accepts the array form expo-router can hand back for a dynamic segment", () => {
    expect(getGuideBySlug(["nida-nin-application"])?.slug).toBe("nida-nin-application");
  });

  it("returns undefined for an unknown or missing slug", () => {
    expect(getGuideBySlug("not-a-guide")).toBeUndefined();
    expect(getGuideBySlug(undefined)).toBeUndefined();
  });
});
