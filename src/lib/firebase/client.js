import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyC1X4XwAwT59ZgVPiHPInFCQqPC6ibe2EQ",
  authDomain: "ucademy-87dc5.firebaseapp.com",
  projectId: "ucademy-87dc5",
  storageBucket: "ucademy-87dc5.firebasestorage.app",
  messagingSenderId: "858279201138",
  appId: "1:858279201138:web:c77e56c4082f12780b75eb",
  measurementId: "G-YPPCZH1FSN"
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
