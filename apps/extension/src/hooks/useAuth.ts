import { useState, useEffect } from 'react';
import { auth } from '@vault/shared';
import { onAuthStateChanged } from 'firebase/auth';

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        // Check immediate session state from background
        chrome.runtime.sendMessage({ action: 'GET_SESSION_STATE' }, (response) => {
            if (response?.auth?.userId) {
                // Already synced in background
            }
        });

        return () => unsubscribe();
    }, []);

    return { user, loading };
}
