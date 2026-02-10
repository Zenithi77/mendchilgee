import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import { storage } from "./firebase";

// Upload a file and get download URL
export const uploadFile = async (file, path) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

// Upload with progress tracking
export const uploadFileWithProgress = (file, path, onProgress) => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      },
    );
  });
};

// Get download URL for an existing file
export const getFileURL = async (path) => {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
};

// Delete a file
export const deleteFile = async (path) => {
  const storageRef = ref(storage, path);
  return deleteObject(storageRef);
};

// List all files in a folder
export const listFiles = async (folderPath) => {
  const folderRef = ref(storage, folderPath);
  const result = await listAll(folderRef);

  const files = await Promise.all(
    result.items.map(async (itemRef) => ({
      name: itemRef.name,
      fullPath: itemRef.fullPath,
      url: await getDownloadURL(itemRef),
    })),
  );

  return files;
};

// ============================================
// Valentine App Specific Functions
// ============================================

// Upload a memory photo
export const uploadMemoryPhoto = async (file, userId) => {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const path = `memories/${userId}/${fileName}`;
  return uploadFile(file, path);
};

// Upload memory photo with progress
export const uploadMemoryPhotoWithProgress = (file, userId, onProgress) => {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const path = `memories/${userId}/${fileName}`;
  return uploadFileWithProgress(file, path, onProgress);
};

// Upload a memory video
export const uploadMemoryVideo = async (file, userId) => {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const path = `videos/${userId}/${fileName}`;
  return uploadFile(file, path);
};

// Get all memory photos for a user
export const getUserMemoryPhotos = async (userId) => {
  return listFiles(`memories/${userId}`);
};

// Upload profile/couple photo
export const uploadCouplePhoto = async (file, coupleId) => {
  const path = `couples/${coupleId}/profile.jpg`;
  return uploadFile(file, path);
};
