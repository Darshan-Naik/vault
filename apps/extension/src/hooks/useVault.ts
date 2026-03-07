import { useState, useEffect } from 'react';

export function useVault(hostname?: string) {
    const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem('vault_unlocked_guess') === 'true');
    const [sessionMasterKey, setSessionMasterKey] = useState<string | null>(null);
    const [matchedCredentials, setMatchedCredentials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [pendingSave, setPendingSave] = useState<any | null>(null);

    const checkSession = () => {
        // 1. Double check with shared storage immediately
        chrome.storage.session.get(['vault_master_key', 'vault_pending_save'], (result) => {
            if (result.vault_master_key) {
                setIsUnlocked(true);
                setSessionMasterKey(result.vault_master_key);
                localStorage.setItem('vault_unlocked_guess', 'true');
            } else {
                setIsUnlocked(false);
                setSessionMasterKey(null);
                localStorage.setItem('vault_unlocked_guess', 'false');
            }
            if (result.vault_pending_save) {
                setPendingSave(result.vault_pending_save);
            }
        });

        // 2. Refresh from background for synced state
        chrome.runtime.sendMessage({ action: 'GET_SESSION_STATE' }, (response) => {
            if (response && response.isUnlocked) {
                setIsUnlocked(true);
                setSessionMasterKey(response.session.masterKey);
                localStorage.setItem('vault_unlocked_guess', 'true');
            } else {
                setIsUnlocked(false);
                setSessionMasterKey(null);
                localStorage.setItem('vault_unlocked_guess', 'false');
            }
            setLoading(false);
        });
    };

    const fetchMatches = (host: string) => {
        chrome.runtime.sendMessage({
            action: "GET_CREDENTIALS",
            hostname: host
        }, (response) => {
            if (response && response.credentials) {
                setMatchedCredentials(response.credentials);
            }
        });
    };

    useEffect(() => {
        checkSession();
    }, []);

    useEffect(() => {
        if (hostname) {
            fetchMatches(hostname);
        }
    }, [hostname, isUnlocked]);

    return {
        isUnlocked,
        setIsUnlocked,
        sessionMasterKey,
        setSessionMasterKey,
        matchedCredentials,
        setMatchedCredentials,
        pendingSave,
        loading,
        refresh: checkSession
    };
}
