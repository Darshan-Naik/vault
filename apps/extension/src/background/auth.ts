import { auth } from '@vault/shared';
import { onAuthStateChanged } from 'firebase/auth';
import { clearCache } from './state';

export const getAuthUser = () => new Promise<any>((resolve) => {
    if (auth.currentUser) return resolve(auth.currentUser);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
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

            transaction.oncomplete = () => resolve(true);
        };

        requestDB.onerror = () => resolve(false);
    });
};

export const syncUserLogout = (): Promise<boolean> => {
    return new Promise((resolve) => {
        const requestDB = indexedDB.open('firebaseLocalStorageDb');
        requestDB.onsuccess = (event: any) => {
            const db = event.target.result;
            try {
                const transaction = db.transaction(['firebaseLocalStorage'], 'readwrite');
                const store = transaction.objectStore('firebaseLocalStorage');
                store.clear();
            } catch (e) { }
            clearCache();
            resolve(true);
        };
        requestDB.onerror = () => {
            clearCache();
            resolve(false);
        };
    });
};
