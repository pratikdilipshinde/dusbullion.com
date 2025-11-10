// lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence, type Auth } from "firebase/auth";

// Read config from env
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  // Optional but recommended if your config includes them:
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

// Create (or reuse) the Firebase app
function createFirebaseApp(): FirebaseApp {
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId) {
    // Helps you notice missing env vars during dev
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("⚠️ Missing Firebase env vars. Check .env.local");
    }
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

const app = createFirebaseApp();

// Initialize Auth (client-side only)
let auth: Auth;
if (typeof window !== "undefined") {
  auth = getAuth(app);
  // Persist the session (stay logged in across reloads)
  setPersistence(auth, browserLocalPersistence).catch(() => {
    // Ignore if browser blocks (e.g., in private mode)
  });
}

// Export app + auth (auth is undefined on the server)
export { app, auth };
