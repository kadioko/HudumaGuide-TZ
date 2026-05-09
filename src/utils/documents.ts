import { UserDocument } from "@/types";

export function getDocumentStatus(document: UserDocument) {
  if (!document.expiresOn) {
    return { label: "No expiry", tone: "neutral" as const, days: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(document.expiresOn);
  expiry.setHours(0, 0, 0, 0);
  const days = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return { label: "Expired", tone: "danger" as const, days };
  }

  if (days <= 30) {
    return { label: `${days} days left`, tone: "warning" as const, days };
  }

  return { label: "Valid", tone: "success" as const, days };
}

export function getExpiringDocuments(documents: UserDocument[], daysAhead = 30) {
  return documents.filter((document) => {
    const status = getDocumentStatus(document);
    return typeof status.days === "number" && status.days >= 0 && status.days <= daysAhead;
  });
}
