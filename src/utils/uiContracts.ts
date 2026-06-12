import { documentUploadConfig } from "@/config/uploads";
import { serviceGuides } from "@/data/serviceGuides";
import { OnboardingPersona, ServiceGuide, UserDocument } from "@/types";
import { getDocumentNextAction, getExpiringDocuments } from "@/utils/documents";

export const onboardingPersonaOptions: { value: OnboardingPersona; label: string }[] = [
  { value: "citizen", label: "Citizen" },
  { value: "student", label: "Student" },
  { value: "business_owner", label: "Business owner" },
  { value: "driver", label: "Driver" },
  { value: "family_admin", label: "Family admin" }
];

export function getGuideDetailUiContract(guide: ServiceGuide) {
  return {
    hasOfficialPortal: guide.officialUrl.startsWith("https://"),
    hasMsaidiziScope: Boolean(guide.slug),
    requiredDocumentCount: guide.requiredDocuments.length,
    stepCount: guide.steps.length,
    sourceRefCount: guide.officialSourceRefs?.length ?? 0,
    canCreateReminderTemplate: guide.steps.some((step) => Boolean(step.reminderTemplate))
  };
}

export function getDocumentVaultUiContract(documents: UserDocument[], signedIn: boolean) {
  return {
    documentCount: documents.length,
    expiringCount: getExpiringDocuments(documents).length,
    nextAction: documents[0] ? getDocumentNextAction(documents[0]) : "Add a document record to track expiry dates and reminders.",
    uploadLimitBytes: documentUploadConfig.maxBytes,
    allowedTypes: Object.keys(documentUploadConfig.allowedFileTypes),
    storageReferenceCount: documents.filter((document) => document.fileName).length,
    localOnlyStorageReferenceCount: signedIn ? 0 : documents.filter((document) => document.fileName).length
  };
}

export function getPersonaHomePriority(persona: OnboardingPersona) {
  if (persona === "business_owner") {
    return ["business-name-registration", "tin-registration", "business-licence-application"];
  }

  if (persona === "driver") {
    return ["driving-licence-renewal", "nida-nin-application"];
  }

  if (persona === "student" || persona === "family_admin") {
    return ["birth-certificate-application", "nida-nin-application", "passport-application"];
  }

  return serviceGuides.slice(0, 3).map((guide) => guide.slug);
}
