import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { env } from '$env/dynamic/public'; // Fallback if needed, but best practice is below

// In SvelteKit, env variables are available from $env/static/public
import { 
    PUBLIC_FIREBASE_API_KEY, 
    PUBLIC_FIREBASE_AUTH_DOMAIN, 
    PUBLIC_FIREBASE_PROJECT_ID, 
    PUBLIC_FIREBASE_STORAGE_BUCKET, 
    PUBLIC_FIREBASE_MESSAGING_SENDER_ID, 
    PUBLIC_FIREBASE_APP_ID, 
    PUBLIC_FIREBASE_MEASUREMENT_ID 
} from '$env/static/public';

const firebaseConfig = {
    apiKey: PUBLIC_FIREBASE_API_KEY,
    authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: PUBLIC_FIREBASE_APP_ID,
    measurementId: PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only once
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

// Initialize services
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Initialize Analytics only on client side
let analytics;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}

export { app, db, storage, auth, analytics };
