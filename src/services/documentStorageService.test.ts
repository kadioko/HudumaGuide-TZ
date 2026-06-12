import { describe, expect, it, vi } from "vitest";
import { getSafeFileExtension, maxDocumentUploadBytes, sanitizePathSegment, validateDocumentFile, validateFileSignature } from "@/services/documentStorageService";

vi.mock("expo-document-picker", () => ({}));
vi.mock("expo-file-system/legacy", () => ({}));
vi.mock("expo-image-picker", () => ({}));
vi.mock("expo-linking", () => ({}));
vi.mock("@/lib/supabase", () => ({ supabase: undefined }));
vi.mock("@/services/runtimeLogger", () => ({ reportRuntimeIssue: vi.fn() }));

describe("document storage validation", () => {
  it("accepts allowed document types and normalizes extensions", () => {
    const file = { name: "nida-copy.PDF", uri: "file://nida-copy.PDF", mimeType: "application/pdf", size: 1234 };

    expect(() => validateDocumentFile(file)).not.toThrow();
    expect(getSafeFileExtension(file)).toBe("pdf");
  });

  it("rejects oversized files before base64 loading", () => {
    expect(() =>
      validateDocumentFile({
        name: "large.pdf",
        uri: "file://large.pdf",
        mimeType: "application/pdf",
        size: maxDocumentUploadBytes + 1
      })
    ).toThrow("File is too large");
  });

  it("rejects unsupported file types", () => {
    expect(() =>
      validateDocumentFile({
        name: "script.js",
        uri: "file://script.js",
        mimeType: "application/javascript",
        size: 100
      })
    ).toThrow("Unsupported file type");
  });

  it("sanitizes storage path segments", () => {
    expect(sanitizePathSegment("../user id/with spaces")).toBe("..-user-id-with-spaces");
    expect(sanitizePathSegment("")).toBe("item");
  });

  it("sniffs obvious PDF/JPG/PNG signature mismatches", () => {
    expect(() => validateFileSignature("not-a-pdf", { name: "file.pdf", uri: "file://file.pdf", mimeType: "application/pdf" })).toThrow(
      "PDF"
    );
    expect(() => validateFileSignature("JVBERi0x", { name: "file.pdf", uri: "file://file.pdf", mimeType: "application/pdf" })).not.toThrow();
  });

  it("sniffs HEIC/HEIF brand markers", () => {
    const heicHeader = Buffer.from([0, 0, 0, 24, 102, 116, 121, 112, 104, 101, 105, 99]).toString("base64");
    expect(() => validateFileSignature(heicHeader, { name: "file.heic", uri: "file://file.heic", mimeType: "image/heic" })).not.toThrow();
    expect(() => validateFileSignature("AAAA", { name: "file.heic", uri: "file://file.heic", mimeType: "image/heic" })).toThrow("HEIC/HEIF");
  });
});
