import { db, storage } from './client';
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    deleteDoc, 
    query, 
    orderBy 
} from 'firebase/firestore';
import { 
    ref, 
    uploadString, 
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';

const MAPS_COLLECTION = 'maps';

// --- Firestore: Maps ---

export async function getMaps() {
    try {
        const q = query(collection(db, MAPS_COLLECTION), orderBy('title'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching maps:", error);
        return [];
    }
}

export async function getMapById(id) {
    try {
        const docRef = doc(db, MAPS_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.warn("No such map!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching map by ID:", error);
        return null;
    }
}

export async function saveMap(mapData) {
    try {
        const { id, ...data } = mapData;
        const mapId = id || `map-${Date.now()}`;
        const docRef = doc(db, MAPS_COLLECTION, mapId);
        await setDoc(docRef, { id: mapId, ...data }, { merge: true });
        return { id: mapId, ...data };
    } catch (error) {
        console.error("Error saving map:", error);
        throw error;
    }
}

export async function deleteMap(id) {
    try {
        await deleteDoc(doc(db, MAPS_COLLECTION, id));
    } catch (error) {
        console.error("Error deleting map:", error);
        throw error;
    }
}

// --- Storage: Images ---

/**
 * Uploads an image to Firebase Storage and returns the public download URL.
 * It handles both standard File objects and Data URLs (base64).
 */
export async function uploadImage(path, fileOrDataUrl) {
    try {
        const imageRef = ref(storage, path);
        
        if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
            // It's a Data URL (from FileReader)
            await uploadString(imageRef, fileOrDataUrl, 'data_url');
        } else {
            // It's a File object
            await uploadBytes(imageRef, fileOrDataUrl);
        }
        
        const downloadUrl = await getDownloadURL(imageRef);
        return downloadUrl;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
}

/**
 * Deletes an image from Firebase Storage given its full path or download URL.
 */
export async function deleteImageByUrl(url) {
    try {
        if (!url || !url.includes('firebasestorage')) return;
        // Firebase Storage allows creating a ref from a download URL
        const imageRef = ref(storage, url);
        await deleteObject(imageRef);
    } catch (error) {
        console.error("Error deleting image:", error);
        // We might not want to throw here if the image was already deleted or not found
    }
}

// --- Firestore: Page Content (e.g., Fundacion) ---

export async function getPageContent(collectionName, docName = 'content') {
    try {
        const docRef = doc(db, collectionName, docName);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error fetching page content for ${collectionName}:`, error);
        return null;
    }
}

export async function savePageContent(collectionName, data, docName = 'content') {
    try {
        const docRef = doc(db, collectionName, docName);
        await setDoc(docRef, data, { merge: true });
        return data;
    } catch (error) {
        console.error(`Error saving page content for ${collectionName}:`, error);
        throw error;
    }
}

// --- Firestore: News (Blog) ---
const NEWS_COLLECTION = 'fundacion_news';

export async function getNews() {
    try {
        const q = query(collection(db, NEWS_COLLECTION), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
}

export async function getNewsBySlug(slug) {
    try {
        const docRef = doc(db, NEWS_COLLECTION, slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching news by slug:", error);
        return null;
    }
}

export async function saveNewsItem(slug, data) {
    try {
        const docRef = doc(db, NEWS_COLLECTION, slug);
        const isNew = !(await getDoc(docRef)).exists();
        
        await setDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString(),
            ...(isNew && { createdAt: new Date().toISOString() })
        }, { merge: true });
        
        return { id: slug, ...data };
    } catch (error) {
        console.error("Error saving news:", error);
        throw error;
    }
}

export async function deleteNewsItem(slug) {
    try {
        await deleteDoc(doc(db, NEWS_COLLECTION, slug));
    } catch (error) {
        console.error("Error deleting news:", error);
        throw error;
    }
}

// --- Firestore: Hugo Blog ---
const HUGO_BLOG_COLLECTION = 'hugo_blog';

export async function getHugoNews() {
    try {
        const q = query(collection(db, HUGO_BLOG_COLLECTION), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching hugo blog news:", error);
        return [];
    }
}

export async function getHugoNewsBySlug(slug) {
    try {
        const docRef = doc(db, HUGO_BLOG_COLLECTION, slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching hugo news by slug:", error);
        return null;
    }
}

export async function saveHugoNewsItem(slug, data) {
    try {
        const docRef = doc(db, HUGO_BLOG_COLLECTION, slug);
        const isNew = !(await getDoc(docRef)).exists();
        
        await setDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString(),
            ...(isNew && { createdAt: new Date().toISOString() })
        }, { merge: true });
        
        return { id: slug, ...data };
    } catch (error) {
        console.error("Error saving hugo news:", error);
        throw error;
    }
}

export async function deleteHugoNewsItem(slug) {
    try {
        await deleteDoc(doc(db, HUGO_BLOG_COLLECTION, slug));
    } catch (error) {
        console.error("Error deleting hugo news:", error);
        throw error;
    }
}

