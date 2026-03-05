// Firebase core exports
export { auth, db } from "../firebase";

// Auth service exports
export {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logout,
  onAuthChange,
  getCurrentUser,
} from "./authService";

// Firestore service exports
export {
  addDocument,
  setDocument,
  getDocument,
  getDocuments,
  queryDocuments,
  updateDocument,
  deleteDocument,
  subscribeToDocument,
  subscribeToCollection,
  saveValentineResponse,
  getValentineResponse,
  saveMemory,
  getMemories,
  subscribeToMemories,
} from "./firestoreService";

// Storage / Cloudinary service exports
export {
  uploadFile,
  uploadFileWithProgress,
  uploadMemoryPhoto,
  uploadMemoryPhotoWithProgress,
  uploadMemoryVideo,
  uploadCouplePhoto,
} from "./cloudinaryService";

// Cloudinary URL optimization helpers
export {
  optimizedImageUrl,
  optimizedVideoUrl,
  videoThumbnailUrl,
} from "./cloudinaryService";
