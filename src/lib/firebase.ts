import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

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

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
