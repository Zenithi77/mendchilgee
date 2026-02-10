import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

// Add a new document with auto-generated ID
export const addDocument = async (collectionName, data) => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

// Set a document with specific ID
export const setDocument = async (collectionName, docId, data, merge = true) => {
  await setDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge });
};

// Get a single document by ID
export const getDocument = async (collectionName, docId) => {
  const docSnap = await getDoc(doc(db, collectionName, docId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

// Get all documents from a collection
export const getDocuments = async (collectionName) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Query documents with filters
export const queryDocuments = async (collectionName, conditions = [], sortBy = null, limitCount = null) => {
  let q = collection(db, collectionName);
  
  if (conditions.length > 0) {
    const queryConstraints = conditions.map(c => where(c.field, c.operator, c.value));
    if (sortBy) {
      queryConstraints.push(orderBy(sortBy.field, sortBy.direction || 'asc'));
    }
    if (limitCount) {
      queryConstraints.push(limit(limitCount));
    }
    q = query(q, ...queryConstraints);
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Update a document
export const updateDocument = async (collectionName, docId, data) => {
  await updateDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp()
  });
};

// Delete a document
export const deleteDocument = async (collectionName, docId) => {
  await deleteDoc(doc(db, collectionName, docId));
};

// Real-time listener for a document
export const subscribeToDocument = (collectionName, docId, callback) => {
  return onSnapshot(doc(db, collectionName, docId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

// Real-time listener for a collection
export const subscribeToCollection = (collectionName, callback) => {
  return onSnapshot(collection(db, collectionName), (querySnapshot) => {
    const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(docs);
  });
};

// ============================================
// Valentine App Specific Functions
// ============================================

// Save user's Valentine choices/responses
export const saveValentineResponse = async (userId, choices) => {
  return setDocument('valentineResponses', userId, {
    choices,
    respondedAt: serverTimestamp()
  });
};

// Get user's Valentine response
export const getValentineResponse = async (userId) => {
  return getDocument('valentineResponses', userId);
};

// Save a memory (photo/video with description)
export const saveMemory = async (memoryData) => {
  return addDocument('memories', memoryData);
};

// Get all memories
export const getMemories = async () => {
  return queryDocuments('memories', [], { field: 'createdAt', direction: 'desc' });
};

// Subscribe to memories in real-time
export const subscribeToMemories = (callback) => {
  return subscribeToCollection('memories', callback);
};
