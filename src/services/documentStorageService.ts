import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { decode } from "base64-arraybuffer";
import { documentUploadConfig } from "@/config/uploads";
import { supabase } from "@/lib/supabase";
import { reportRuntimeIssue } from "@/services/runtimeLogger";

export type PickedDocumentFile = {
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
};

const bucketName = "user-documents";
export const maxDocumentUploadBytes = documentUploadConfig.maxBytes;

const { allowedFileTypes } = documentUploadConfig;

export async function pickDocumentFile() {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,
    type: ["application/pdf", "image/jpeg", "image/png", "image/heic", "image/heif"]
  });

  if (result.canceled || !result.assets[0]) {
    return undefined;
  }

  const asset = result.assets[0];
  return {
    name: asset.name,
    uri: asset.uri,
    mimeType: asset.mimeType,
    size: asset.size
  };
}

export async function captureDocumentImage() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Camera permission is required to capture a document image.");
  }

  const result = await ImagePicker.launchCameraAsync({
    quality: 0.72,
    allowsEditing: false
  });

  if (result.canceled || !result.assets[0]) {
    return undefined;
  }

  const asset = result.assets[0];
  return {
    name: `camera-${Date.now()}.jpg`,
    uri: asset.uri,
    mimeType: asset.mimeType ?? "image/jpeg",
    size: asset.fileSize
  };
}

export async function uploadDocumentFile(file: PickedDocumentFile, userId: string, documentId: string) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  validateDocumentFile(file);
  const extension = getSafeFileExtension(file);
  const storagePath = `${sanitizePathSegment(userId)}/${sanitizePathSegment(documentId)}/${Date.now()}.${extension}`;
  const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: "base64" });
  validateFileSignature(base64, file);
  const body = decode(base64);
  const { error } = await supabase.storage.from(bucketName).upload(storagePath, body, {
    contentType: file.mimeType ?? "application/octet-stream",
    upsert: true
  });

  if (error) {
    reportRuntimeIssue("document-upload", error, { mimeType: file.mimeType, size: file.size });
    throw error;
  }

  return storagePath;
}

export async function getDocumentSignedUrl(storagePath: string) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase.storage.from(bucketName).createSignedUrl(storagePath, 60);
  if (error) {
    reportRuntimeIssue("document-signed-url", error);
    throw error;
  }

  return data.signedUrl;
}

export async function openDocumentFile(storagePath: string) {
  const signedUrl = await getDocumentSignedUrl(storagePath);
  await Linking.openURL(signedUrl);
}

export async function deleteDocumentFile(storagePath: string) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.storage.from(bucketName).remove([storagePath]);
  if (error) {
    reportRuntimeIssue("document-delete", error);
    throw error;
  }
}

export function validateDocumentFile(file: PickedDocumentFile) {
  if (file.size && file.size > maxDocumentUploadBytes) {
    throw new Error("File is too large. Upload a PDF or image under 8 MB.");
  }

  const mimeType = normalizeMimeType(file.mimeType);
  const extension = getFileExtension(file.name);
  const allowedExtension = mimeType ? allowedFileTypes[mimeType] : undefined;
  const acceptedExtensions = new Set<string>(Object.values(allowedFileTypes));

  if (mimeType && allowedExtension) {
    return;
  }

  if (extension && acceptedExtensions.has(extension)) {
    return;
  }

  throw new Error("Unsupported file type. Upload PDF, JPG, PNG, HEIC, or HEIF.");
}

export function validateFileSignature(base64: string, file: PickedDocumentFile) {
  const extension = getSafeFileExtension(file);
  const header = base64.slice(0, 24);
  const bytes = new Uint8Array(decode(base64));

  if (extension === "pdf" && !header.startsWith("JVBERi0")) {
    throw new Error("File contents do not look like a PDF.");
  }

  if (extension === "jpg" && !header.startsWith("/9j/")) {
    throw new Error("File contents do not look like a JPG image.");
  }

  if (extension === "png" && !header.startsWith("iVBORw0KGgo")) {
    throw new Error("File contents do not look like a PNG image.");
  }

  if ((extension === "heic" || extension === "heif") && !hasHeifBrand(bytes)) {
    throw new Error("File contents do not look like a HEIC/HEIF image.");
  }
}

function hasHeifBrand(bytes: Uint8Array) {
  if (bytes.length < 12) {
    return false;
  }

  const marker = String.fromCharCode(...bytes.slice(4, 12));
  return marker.startsWith("ftyp") && ["heic", "heix", "hevc", "hevx", "heif", "mif1", "msf1"].includes(marker.slice(4));
}

export function getSafeFileExtension(file: PickedDocumentFile) {
  const mimeType = normalizeMimeType(file.mimeType);
  if (mimeType && allowedFileTypes[mimeType]) {
    return allowedFileTypes[mimeType];
  }

  return getFileExtension(file.name) ?? "bin";
}

export function sanitizePathSegment(value: string) {
  const sanitized = value
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .join("-")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

  return sanitized || "item";
}

function normalizeMimeType(mimeType?: string): keyof typeof allowedFileTypes | undefined {
  const normalized = mimeType?.toLowerCase().trim();
  return normalized && normalized in allowedFileTypes ? (normalized as keyof typeof allowedFileTypes) : undefined;
}

function getFileExtension(name: string) {
  const extension = name.includes(".") ? name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") : undefined;
  return extension || undefined;
}
