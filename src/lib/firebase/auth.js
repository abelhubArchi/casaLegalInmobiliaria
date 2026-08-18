import { auth } from './client';
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'firebase/auth';
import { writable } from 'svelte/store';

// Global auth store
export const user = writable(null);
export const authInitialized = writable(false);

// Listen to auth state changes
if (typeof window !== 'undefined') {
    onAuthStateChanged(auth, (currentUser) => {
        user.set(currentUser);
        authInitialized.set(true);
    });
}

export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: error.message };
    }
}

export async function logout() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error("Logout error:", error);
        return { success: false, error: error.message };
    }
}
