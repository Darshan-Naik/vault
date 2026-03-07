import { auth } from '@vault/shared';
import { onAuthStateChanged } from 'firebase/auth';
import { clearCache } from './state';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { startVaultSync, stopVaultSync } from './sync';

export const getAuthUser = () => new Promise<any>((resolve) => {
    if (auth.currentUser) {
        storage.set(STORAGE_KEYS.USER_PROFILE, { uid: auth.currentUser.uid, email: auth.currentUser.email }, 'local');
        return resolve(auth.currentUser);
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user) {
            storage.set(STORAGE_KEYS.USER_PROFILE, { uid: user.uid, email: user.email }, 'local');
            startVaultSync(user.uid);
        } else {
            storage.remove(STORAGE_KEYS.USER_PROFILE, 'local');
            stopVaultSync();
        }
        resolve(user);
    });
});

export const syncUserAuth = (userJson: any, apiKey: string): Promise<boolean> => {
    return new Promise((resolve) => {
        const fbaseKey = `firebase:authUser:${apiKey}:[DEFAULT]`;
        const requestDB = indexedDB.open('firebaseLocalStorageDb');

        requestDB.onupgradeneeded = (event: any) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('firebaseLocalStorage')) {
                db.createObjectStore('firebaseLocalStorage', { keyPath: 'fbase_key' });
            }
        };

        requestDB.onsuccess = (event: any) => {
            const db = event.target.result;
            const transaction = db.transaction(['firebaseLocalStorage'], 'readwrite');
            const store = transaction.objectStore('firebaseLocalStorage');
            store.put({ fbase_key: fbaseKey, value: userJson });

            // Also cache user profile for instant extension access
            if (userJson) {
                storage.set(STORAGE_KEYS.USER_PROFILE, { uid: userJson.uid, email: userJson.email }, 'local');
                startVaultSync(userJson.uid);
            }

            transaction.oncomplete = () => resolve(true);
        };

        requestDB.onerror = () => resolve(false);
    });
};

export const syncUserLogout = (): Promise<boolean> => {
    return new Promise((resolve) => {
        const requestDB = indexedDB.open('firebaseLocalStorageDb');
        requestDB.onsuccess = async (event: any) => {
            const db = event.target.result;
            try {
                const transaction = db.transaction(['firebaseLocalStorage'], 'readwrite');
                const store = transaction.objectStore('firebaseLocalStorage');
                store.clear();
            } catch (e) { }
            stopVaultSync();
            await storage.remove(STORAGE_KEYS.USER_PROFILE, 'local');
            await clearCache();
            resolve(true);
        };
        requestDB.onerror = async () => {
            await clearCache();
            resolve(false);
        };
    });
};
