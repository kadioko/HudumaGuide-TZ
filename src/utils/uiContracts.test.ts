import { describe, expect, it } from "vitest";
import { serviceGuides } from "@/data/serviceGuides";
import { UserDocument } from "@/types";
import { getDocumentVaultUiContract, getGuideDetailUiContract, getPersonaHomePriority, onboardingPersonaOptions } from "@/utils/uiContracts";

describe("UI contracts", () => {
  it("supports guide detail trust, source, and Msaidizi actions", () => {
    const guide = serviceGuides[0];
    const contract = getGuideDetailUiContract(guide);

    expect(contract.hasOfficialPortal).toBe(true);
    expect(contract.hasMsaidiziScope).toBe(true);
    expect(contract.requiredDocumentCount).toBeGreaterThan(0);
    expect(contract.stepCount).toBeGreaterThan(0);
    expect(contract.sourceRefCount).toBeGreaterThan(0);
  });

  it("summarizes document vault security UI state", () => {
    const documents: UserDocument[] = [
      {
        id: "doc-1",
        title: "Passport",
        documentType: "Passport",
        folder: "Personal Documents",
        expiresOn: "2026-06-20",
        fileName: "users/u1/documents/passport.pdf",
        mimeType: "application/pdf",
        createdAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:00.000Z"
      }
    ];

    const contract = getDocumentVaultUiContract(documents, false);

    expect(contract.documentCount).toBe(1);
    expect(contract.allowedTypes).toContain("application/pdf");
    expect(contract.uploadLimitBytes).toBeGreaterThan(0);
    expect(contract.storageReferenceCount).toBe(1);
    expect(contract.localOnlyStorageReferenceCount).toBe(1);
  });

  it("keeps onboarding personas complete and mapped to useful guide priorities", () => {
    expect(onboardingPersonaOptions.map((option) => option.value)).toEqual([
      "citizen",
      "student",
      "business_owner",
      "driver",
      "family_admin"
    ]);
    expect(getPersonaHomePriority("business_owner")).toContain("business-name-registration");
    expect(getPersonaHomePriority("driver")).toContain("driving-licence-renewal");
  });
});
