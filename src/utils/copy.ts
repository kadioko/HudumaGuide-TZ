import { Language } from "@/types";

export const trustNotice =
  "This is an independent guide. It does not represent any government entity and is not an official government platform. Always confirm final requirements, fees, and procedures through official government channels.";

export const legalTaxNotice =
  "This is general guidance, not legal/tax advice.";

export function pick(language: Language, sw: string, en: string) {
  return language === "sw" ? sw : en;
}

export function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(date));
  } catch {
    return date;
  }
}
