// Firebase core exports
export { auth, db, storage } from "../firebase";

// Auth service exports
export {
  loginWithEmail,
  registerWithEmail,
  loginAnonymously,
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

// Storage service exports
export {
  uploadFile,
  uploadFileWithProgress,
  getFileURL,
  deleteFile,
  listFiles,
  uploadMemoryPhoto,
  uploadMemoryPhotoWithProgress,
  uploadMemoryVideo,
  getUserMemoryPhotos,
  uploadCouplePhoto,
} from "./storageService";
