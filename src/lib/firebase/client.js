import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
    apiKey: "AIzaSyAuDGxuzfOVNBZMj4aN6pC0Yu5xqBV0720",
    authDomain: "casa-legal-inmobiliaria.firebaseapp.com",
    projectId: "casa-legal-inmobiliaria",
    storageBucket: "casa-legal-inmobiliaria.firebasestorage.app",
    messagingSenderId: "294512233346",
    appId: "1:294512233346:web:def9126d3926aa0be25d9b",
    measurementId: "G-7410VBFE98"
};


// Initialize Firebase only once
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

// Initialize services
const db = getFirestore(app, "casalegalbolivia");
const storage = getStorage(app);
const auth = getAuth(app);

// Initialize Analytics only on client side
let analytics;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}

export { app, db, storage, auth, analytics };
