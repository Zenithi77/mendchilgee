// ═══════════════════════════════════════════════════════════════
// Storage Service — now backed by Cloudinary CDN
//
// This file re-exports everything from cloudinaryService so that
// all existing imports continue to work without changes.
// ═══════════════════════════════════════════════════════════════

export {
  uploadFile,
  uploadFileWithProgress,
  uploadMemoryPhoto,
  uploadMemoryPhotoWithProgress,
  uploadMemoryVideo,
  uploadCouplePhoto,
} from "./cloudinaryService";

// These Firebase-specific helpers are no longer needed but kept
// as no-ops so nothing breaks if something references them.
export const getFileURL = async () => "";
export const deleteFile = async () => {};
export const listFiles = async () => [];
export const getUserMemoryPhotos = async () => [];

