// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhVYxIo8J0rTrLSo9jwqxBBUrD4UocMb0",
  authDomain: "valentine-59463.firebaseapp.com",
  projectId: "valentine-59463",
  storageBucket: "valentine-59463.firebasestorage.app",
  messagingSenderId: "73323650380",
  appId: "1:73323650380:web:fdf31ba860a73ea9ad03e9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
