import { describe, expect, it } from "vitest";
import { serviceGuides } from "@/data/serviceGuides";
import { getGuideFreshness } from "@/utils/guideTrust";
import { validateServiceGuides } from "@/utils/serviceGuideSchema";

describe("service guide content", () => {
  it("keeps seed guides valid for trust and rendering", () => {
    expect(validateServiceGuides()).toEqual([]);
  });

  it("adds review metadata defaults to every seed guide", () => {
    for (const guide of serviceGuides) {
      expect(guide.expiresReviewAt).toBeTruthy();
      expect(guide.changeSummaryEn).toBeTruthy();
      expect(getGuideFreshness(guide).label).toMatch(/Verified|Review soon|Needs review|Outdated/);
    }
  });
});
