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

export function getDocumentNextAction(document: UserDocument) {
  const status = getDocumentStatus(document);

  if (status.tone === "danger") {
    return "Expired. Confirm renewal or replacement steps with the issuing authority.";
  }

  if (status.tone === "warning") {
    return "Expiring soon. Set a reminder and confirm renewal requirements.";
  }

  if (!document.fileName) {
    return "Metadata saved. Upload a private file when signed in if you want preview/download.";
  }

  return "Looks current. Keep the original document safe and review before expiry.";
}

export function getDocumentRenewalChecklist(document: UserDocument) {
  const type = document.documentType.toLowerCase();
  const base = ["Confirm current requirements with the issuing authority", "Check name/ID consistency", "Keep receipt or reference number"];

  if (type.includes("passport")) {
    return ["Confirm Immigration passport guidance", "Check birth certificate and NIDA details", "Book/prepare official application steps"];
  }

  if (type.includes("nida") || type.includes("nin")) {
    return ["Confirm NIDA requirements", "Check birth/residence details", "Keep NIN/reference available"];
  }

  if (type.includes("licence") || type.includes("license")) {
    return ["Confirm renewal channel and fees", "Check expiry date and class/category", "Set reminder before deadline"];
  }

  if (type.includes("tin") || type.includes("tax")) {
    return ["Confirm TRA taxpayer portal details", "Check business/personal TIN context", "Set compliance reminders"];
  }

  return base;
}
