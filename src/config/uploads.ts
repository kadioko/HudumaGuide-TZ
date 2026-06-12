export const documentUploadConfig = {
  maxBytes: 8 * 1024 * 1024,
  allowedFileTypes: {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/heic": "heic",
    "image/heif": "heif"
  }
} as const;
