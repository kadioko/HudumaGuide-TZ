import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { screenTitles, screenTitle } from "@/constants/screenTitles";

const rootLayout = readFileSync(path.resolve(__dirname, "../../app/_layout.tsx"), "utf8");

describe("screen titles", () => {
  it("provides both languages for every navigation title", () => {
    for (const [key, title] of Object.entries(screenTitles)) {
      expect(title.sw, `${key} is missing a Swahili title`).toBeTruthy();
      expect(title.en, `${key} is missing an English title`).toBeTruthy();
    }
  });

  it("resolves by language", () => {
    expect(screenTitle("privacy", "sw")).toBe("Sera ya Faragha");
    expect(screenTitle("privacy", "en")).toBe("Privacy Policy");
  });

  it("leaves no hardcoded titles in the root stack", () => {
    // Guards the regression this catalog exists to fix: a screen added with a
    // literal English title ships English navigation to Swahili users.
    const hardcoded = [...rootLayout.matchAll(/<Stack\.Screen name="([^"]+)" options=\{\{ title: "/g)].map(
      (match) => match[1]
    );

    expect(hardcoded).toEqual([]);
  });

  it("covers every root stack screen that shows a header", () => {
    const screens = [...rootLayout.matchAll(/<Stack\.Screen name="([^"]+)" options=\{\{ ([^}]*)/g)];
    const titled = screens
      .filter(([, , options]) => !options.includes("headerShown: false"))
      .map(([, name]) => name);

    expect(titled.length).toBeGreaterThan(0);
    for (const name of titled) {
      expect(Object.keys(screenTitles), `${name} has no entry in screenTitles`).toContain(name);
    }
  });
});
