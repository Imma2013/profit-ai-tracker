import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC2YZPSv9IhV3yfbcyD3R0G0qYLhEY2Abw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "profit-ai-web-v2-2026.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "profit-ai-web-v2-2026",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "profit-ai-web-v2-2026.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "211106909383",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:211106909383:web:341d365d28d33276f3c2e2"
};

const app = getApps().length === 0 && firebaseConfig.apiKey 
  ? initializeApp(firebaseConfig) 
  : getApps().length > 0 ? getApps()[0] : null;

export const auth = app ? getAuth(app) : null as any;
export const googleProvider = new GoogleAuthProvider();
