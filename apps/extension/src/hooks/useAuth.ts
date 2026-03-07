import { useState, useEffect } from 'react';
import { auth } from '@vault/shared';
import { onAuthStateChanged } from 'firebase/auth';

export function useAuth() {
    const [user, setUser] = useState<any>(() => {
        try {
            const saved = localStorage.getItem('vault_auth_guess');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    const [loading, setLoading] = useState(() => !localStorage.getItem('vault_auth_guess'));

    useEffect(() => {
        const updateAll = (u: any) => {
            setUser(u);
            setLoading(false);
            if (u) {
                localStorage.setItem('vault_auth_guess', JSON.stringify({ uid: u.uid, email: u.email }));
            } else {
                localStorage.removeItem('vault_auth_guess');
            }
        };

        // 1. Listen for background state updates
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            updateAll(u);
        });

        // 2. Double check with background script
        chrome.runtime.sendMessage({ action: 'GET_SESSION_STATE' }, (response) => {
            if (response?.auth?.userId) {
                updateAll({ uid: response.auth.userId, email: response.auth.email });
            } else if (response && !response.isAuth) {
                updateAll(null);
            }
        });

        return () => unsubscribe();
    }, []);

    return { user, loading };
}
