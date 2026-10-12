import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

/**
 * Checks whether valid Firebase credentials have been configured in .env
 */
export function isFirebaseConfigured(): boolean {
  return (
    Boolean(firebaseConfig.projectId) &&
    Boolean(firebaseConfig.apiKey) &&
    firebaseConfig.projectId !== 'your_project_id' &&
    firebaseConfig.apiKey !== 'your_api_key_here'
  );
}

/**
 * Gets or initializes the Firebase Firestore instance.
 * Returns null if Firebase credentials are not configured.
 */
export function getFirebaseFirestore(): Firestore | null {
  if (!isFirebaseConfigured()) {
    return null;
  }

  if (!db) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    db = getFirestore(app);
  }

  return db;
}
