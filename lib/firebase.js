// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDqDSxM_u0237E7hTQm6WBxXnG9BDQ16uQ",
  authDomain: "uiu-vc-cup.firebaseapp.com",
  projectId: "uiu-vc-cup",
  storageBucket: "uiu-vc-cup.firebasestorage.app",
  messagingSenderId: "381635982683",
  appId: "1:381635982683:web:426354cbeabdc2b9e1967e",
  measurementId: "G-GF3VRGXR41"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
