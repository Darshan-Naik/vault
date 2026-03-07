import { useState, useEffect } from 'react';

export function useVault(hostname?: string) {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [sessionMasterKey, setSessionMasterKey] = useState<string | null>(null);
    const [matchedCredentials, setMatchedCredentials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const checkSession = () => {
        chrome.runtime.sendMessage({ action: 'GET_SESSION_STATE' }, (response) => {
            if (response && response.isUnlocked) {
                setIsUnlocked(true);
                setSessionMasterKey(response.session.masterKey);
            } else {
                setIsUnlocked(false);
                setSessionMasterKey(null);
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
        loading,
        refresh: checkSession
    };
}
