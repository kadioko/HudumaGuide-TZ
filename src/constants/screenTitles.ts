import { Language } from "@/types";

type LocalizedTitle = { sw: string; en: string };

/**
 * Navigation titles for the root stack, keyed by expo-router route name.
 *
 * Kept as a catalog rather than inline `language === "sw" ? ... : ...` pairs so
 * the full set of navigation strings can be reviewed, translated, and tested in
 * one place.
 *
 * Swahili follows the code-switched style used elsewhere in the app, which
 * keeps established app-domain loanwords ("checklist", "reminder", "roadmap",
 * "sync") rather than forcing literal translations users would not recognise.
 */
export const screenTitles = {
  "auth/index": { sw: "Akaunti", en: "Account" },
  "services/[slug]/index": { sw: "Mwongozo wa Huduma", en: "Service Guide" },
  "services/[slug]/checklist": { sw: "Checklist", en: "Checklist" },
  checklists: { sw: "Checklist Zilizohifadhiwa", en: "Saved Checklists" },
  msaidizi: { sw: "Msaidizi", en: "Msaidizi" },
  "sync-review": { sw: "Ukaguzi wa Sync", en: "Sync Review" },
  "account-deletion": { sw: "Futa Akaunti", en: "Delete Account" },
  "beta-readiness": { sw: "Utayari wa Beta", en: "Beta Readiness" },
  "admin/index": { sw: "Konsoli ya Admin", en: "Admin Console" },
  "admin/categories": { sw: "Aina za Huduma", en: "Service Categories" },
  "admin/guides": { sw: "Miongozo ya Huduma", en: "Service Guides" },
  "admin/reports": { sw: "Foleni ya Mapitio", en: "Review Queue" },
  "admin/analytics": { sw: "Analytics", en: "Analytics" },
  "admin/versions": { sw: "Matoleo ya Maudhui", en: "Content Versions" },
  "admin/storage-cleanup": { sw: "Kusafisha Storage", en: "Storage Cleanup" },
  "biashara/wizard": { sw: "BiasharaStart", en: "BiasharaStart" },
  "biashara/roadmap": { sw: "Roadmap ya Biashara", en: "Business Roadmap" },
  "biashara/profile": { sw: "Wasifu wa Biashara", en: "Business Profile" },
  "reminders/create": { sw: "Weka Reminder", en: "Create Reminder" },
  "notifications/settings": { sw: "Mipangilio ya Arifa", en: "Notification Settings" },
  "documents/upload": { sw: "Pakia Document", en: "Upload Document" },
  disclaimer: { sw: "Kuhusu na Kanusho", en: "About & Disclaimer" },
  privacy: { sw: "Sera ya Faragha", en: "Privacy Policy" },
  terms: { sw: "Masharti", en: "Terms" },
  feedback: { sw: "Ripoti Taarifa Isiyo Sahihi", en: "Report Outdated Info" },
  support: { sw: "Msaada na Usalama", en: "Support & Safety" }
} satisfies Record<string, LocalizedTitle>;

export type ScreenTitleKey = keyof typeof screenTitles;

export function screenTitle(key: ScreenTitleKey, language: Language) {
  const title = screenTitles[key];
  return language === "sw" ? title.sw : title.en;
}
