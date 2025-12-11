import { upload } from "@vercel/blob/client";

export type BlobBucket = "admin" | "default";

export interface BlobUploadOptions {
  bucket?: BlobBucket;
  access?: "public";
}

/**
 * Helper function to upload files to Vercel Blob stores
 * @param filename - The name of the file to upload
 * @param file - The file to upload
 * @param options - Upload options including bucket selection
 * @returns Promise with the blob upload result
 */
export async function uploadToBlob(
  filename: string,
  file: File | Blob,
  options: BlobUploadOptions = {}
) {
  const { bucket = "default", access = "public" } = options;

  const handleUploadUrl = `/api/image/upload${
    bucket !== "default" ? `?bucket=${bucket}` : ""
  }`;

  return await upload(filename, file, {
    access,
    handleUploadUrl,
  });
}

/**
 * Upload files to the default bucket (main app)
 */
export const uploadFile = (filename: string, file: File | Blob) =>
  uploadToBlob(filename, file, { bucket: "default" });

/**
 * Upload admin files to the admin bucket
 */
export const uploadAdminFile = (filename: string, file: File | Blob) =>
  uploadToBlob(filename, file, { bucket: "admin" });
