// ═══════════════════════════════════════════════════════════════
// Cloudinary Upload Service
// Replaces Firebase Storage with Cloudinary CDN
// ═══════════════════════════════════════════════════════════════

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}`;

/**
 * Upload a file (image or video) to Cloudinary.
 *
 * @param {File} file - The file to upload
 * @param {object} opts
 * @param {"image"|"video"} opts.resourceType - "image" or "video"
 * @param {string}          opts.folder       - Cloudinary folder path
 * @param {Function}        [opts.onProgress] - Progress callback (0-100)
 * @returns {Promise<{ url: string, publicId: string, resourceType: string }>}
 */
export function uploadToCloudinary(file, { resourceType = "image", folder = "", onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    if (folder) formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${UPLOAD_URL}/${resourceType}/upload`);

    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          resourceType: data.resource_type,
          width: data.width,
          height: data.height,
          format: data.format,
          bytes: data.bytes,
        });
      } else {
        reject(new Error(`Cloudinary upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
}

// ═══════════════════════════════════════════════════════════════
// Cloudinary URL Transformation Helpers
// Generate optimized URLs with on-the-fly transformations
// ═══════════════════════════════════════════════════════════════

/**
 * Build an optimized image URL with Cloudinary transformations.
 *
 * @param {string} url - Original Cloudinary URL
 * @param {object} opts
 * @param {number} [opts.width]   - Resize width
 * @param {number} [opts.height]  - Resize height
 * @param {string} [opts.quality] - "auto", "auto:low", "auto:good", "auto:best"
 * @param {string} [opts.format]  - "auto", "webp", "avif"
 * @param {string} [opts.crop]    - "fill", "fit", "limit", "thumb"
 * @param {string} [opts.gravity] - "auto", "face", "center"
 * @returns {string}
 */
export function optimizedImageUrl(url, {
  width,
  height,
  quality = "auto",
  format = "auto",
  crop = "fill",
  gravity = "auto",
} = {}) {
  if (!url || !url.includes("cloudinary.com")) return url;

  const parts = [];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  parts.push(`c_${crop}`);
  parts.push(`g_${gravity}`);
  parts.push(`q_${quality}`);
  parts.push(`f_${format}`);

  const transform = parts.join(",");
  // Insert transformation before /upload/ or /v1234/
  return url.replace(/\/upload\//, `/upload/${transform}/`);
}

/**
 * Build an optimized video URL.
 */
export function optimizedVideoUrl(url, {
  width,
  height,
  quality = "auto",
  format = "auto",
} = {}) {
  if (!url || !url.includes("cloudinary.com")) return url;

  const parts = [];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  parts.push(`q_${quality}`);
  parts.push(`f_${format}`);

  const transform = parts.join(",");
  return url.replace(/\/upload\//, `/upload/${transform}/`);
}

/**
 * Generate a thumbnail URL for a video.
 */
export function videoThumbnailUrl(url, { width = 400, height = 300 } = {}) {
  if (!url || !url.includes("cloudinary.com")) return url;
  // Replace file extension with .jpg and add transform
  const transform = `w_${width},h_${height},c_fill,g_auto,q_auto,f_auto,so_1`;
  const thumbUrl = url
    .replace(/\/upload\//, `/upload/${transform}/`)
    .replace(/\.(mp4|mov|avi|webm|mkv)$/i, ".jpg");
  return thumbUrl;
}

// ═══════════════════════════════════════════════════════════════
// App-specific upload helpers (drop-in replacements)
// ═══════════════════════════════════════════════════════════════

/**
 * Upload a memory photo to Cloudinary.
 * @param {File} file
 * @param {string} userId
 * @param {Function} [onProgress]
 * @returns {Promise<string>} CDN URL
 */
export async function uploadMemoryPhoto(file, userId, onProgress) {
  const result = await uploadToCloudinary(file, {
    resourceType: "image",
    folder: `mendchilgee/memories/${userId}`,
    onProgress,
  });
  return result.url;
}

/**
 * Upload a memory photo with progress tracking.
 */
export function uploadMemoryPhotoWithProgress(file, userId, onProgress) {
  return uploadMemoryPhoto(file, userId, onProgress);
}

/**
 * Upload a memory video to Cloudinary.
 * @param {File} file
 * @param {string} userId
 * @param {Function} [onProgress]
 * @returns {Promise<string>} CDN URL
 */
export async function uploadMemoryVideo(file, userId, onProgress) {
  const result = await uploadToCloudinary(file, {
    resourceType: "video",
    folder: `mendchilgee/videos/${userId}`,
    onProgress,
  });
  return result.url;
}

/**
 * Upload profile/couple photo.
 */
export async function uploadCouplePhoto(file, coupleId) {
  const result = await uploadToCloudinary(file, {
    resourceType: "image",
    folder: `mendchilgee/couples/${coupleId}`,
  });
  return result.url;
}

/**
 * Generic file upload.
 */
export async function uploadFile(file, path) {
  const isVideo = file.type?.startsWith("video/");
  const result = await uploadToCloudinary(file, {
    resourceType: isVideo ? "video" : "image",
    folder: `mendchilgee/${path}`,
  });
  return result.url;
}

/**
 * Generic upload with progress.
 */
export function uploadFileWithProgress(file, path, onProgress) {
  const isVideo = file.type?.startsWith("video/");
  return uploadToCloudinary(file, {
    resourceType: isVideo ? "video" : "image",
    folder: `mendchilgee/${path}`,
    onProgress,
  }).then((r) => r.url);
}
