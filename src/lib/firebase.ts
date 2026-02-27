import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";

// Production Configuration for egspec-symposium
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp | undefined;
let database: Database | undefined;

/**
 * Lazy initialization for Firebase services.
 * Only connects on the client side to avoid build-time errors.
 */
const getRtDatabase = (): Database | null => {
    if (typeof window === 'undefined') return null;
    
    if (!app) {
        try {
            app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        } catch (error) {
            console.error("Firebase Initialization Error:", error);
            return null;
        }
    }
    
    if (!database && app) {
        database = getDatabase(app);
    }
    
    return database || null;
};

export { getRtDatabase };