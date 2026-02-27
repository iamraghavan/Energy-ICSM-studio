import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";

// Production Configuration for egspec-symposium
// Hardcoded to ensure stability in serverless/build environments
const firebaseConfig = {
  apiKey: "AIzaSyAVFQNGyAyA0jeemha_LP4qqpok48EkA2s",
  authDomain: "egspec-symposium.firebaseapp.com",
  databaseURL: "https://egspec-symposium-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "egspec-symposium",
  storageBucket: "egspec-symposium.appspot.com",
  messagingSenderId: "850445891754",
  appId: "1:850445891754:web:89c04fa857bd74dc20f8d3",
  measurementId: "G-7LQYGYT08D"
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
