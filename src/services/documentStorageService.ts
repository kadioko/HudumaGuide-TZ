import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { decode } from "base64-arraybuffer";
import { supabase } from "@/lib/supabase";

export type PickedDocumentFile = {
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
};

const bucketName = "user-documents";

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

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const storagePath = `${userId}/${documentId}/${Date.now()}.${extension}`;
  const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: "base64" });
  const body = decode(base64);
  const { error } = await supabase.storage.from(bucketName).upload(storagePath, body, {
    contentType: file.mimeType ?? "application/octet-stream",
    upsert: true
  });

  if (error) {
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
    throw error;
  }
}
