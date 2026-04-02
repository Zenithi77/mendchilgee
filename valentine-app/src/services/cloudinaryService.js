// ═══════════════════════════════════════════════════════════════
// Storage Service — Firebase Storage
// ═══════════════════════════════════════════════════════════════

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

/**
 * Upload a file to Firebase Storage with progress tracking.
 *
 * @param {File} file - The file to upload
 * @param {string} storagePath - Full path in Firebase Storage
 * @param {Function} [onProgress] - Progress callback (0-100)
 * @returns {Promise<string>} Download URL
 */
function uploadToFirebase(file, storagePath, onProgress) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        if (onProgress) {
          const pct = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          );
          onProgress(pct);
        }
      },
      (error) => {
        console.error("Firebase Storage upload error:", error);
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      },
    );
  });
}

// ═══════════════════════════════════════════════════════════════
// URL helpers — passthrough (no server-side transforms for Firebase)
// Kept so existing imports don't break.
// ═══════════════════════════════════════════════════════════════

/**
 * Return the image URL as-is (Firebase Storage doesn't support transforms).
 */
export function optimizedImageUrl(url) {
  return url || "";
}

/**
 * Return the video URL as-is.
 */
export function optimizedVideoUrl(url) {
  return url || "";
}

/**
 * Return the video URL as a "thumbnail" — for Firebase we just return the
 * video URL itself; the browser / <video> element will show the first frame.
 */
export function videoThumbnailUrl(url) {
  return url || "";
}

// ═══════════════════════════════════════════════════════════════
// App-specific upload helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Upload a memory photo to Firebase Storage.
 * @param {File} file
 * @param {string} userId
 * @param {Function} [onProgress]
 * @returns {Promise<string>} Download URL
 */
export async function uploadMemoryPhoto(file, userId, onProgress) {
  const ext = file.name?.split(".").pop() || "jpg";
  const path = `memories/${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  return uploadToFirebase(file, path, onProgress);
}

/**
 * Upload a memory photo with progress tracking.
 */
export function uploadMemoryPhotoWithProgress(file, userId, onProgress) {
  return uploadMemoryPhoto(file, userId, onProgress);
}

/**
 * Upload a memory video to Firebase Storage.
 * @param {File} file
 * @param {string} userId
 * @param {Function} [onProgress]
 * @returns {Promise<string>} Download URL
 */
export async function uploadMemoryVideo(file, userId, onProgress) {
  const ext = file.name?.split(".").pop() || "mp4";
  const path = `videos/${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  return uploadToFirebase(file, path, onProgress);
}

/**
 * Upload profile/couple photo.
 */
export async function uploadCouplePhoto(file, coupleId) {
  const ext = file.name?.split(".").pop() || "jpg";
  const path = `couples/${coupleId}/${Date.now()}.${ext}`;
  return uploadToFirebase(file, path);
}

/**
 * Generic file upload.
 */
export async function uploadFile(file, storagePath) {
  const ext = file.name?.split(".").pop() || "bin";
  const path = `uploads/${storagePath}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  return uploadToFirebase(file, path);
}

/**
 * Generic upload with progress.
 */
export function uploadFileWithProgress(file, storagePath, onProgress) {
  const ext = file.name?.split(".").pop() || "bin";
  const path = `uploads/${storagePath}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  return uploadToFirebase(file, path, onProgress);
}
