/**
 * Storage service for Chrome Extension.
 * Handles both persistent (local) and session (RAM-only) storage.
 */

export const STORAGE_KEYS = {
    MASTER_KEY: 'vault_master_key',
    DECRYPTED_VAULTS: 'vault_decrypted_cache',
    ENCRYPTED_VAULTS: 'vault_encrypted_cache',
    USER_PROFILE: 'vault_user_profile',
    PENDING_SAVE: 'vault_pending_save'
};

/**
 * Access the appropriate storage area.
 * 'session' is cleared on browser close and is not persisted to disk.
 * 'local' is persistent across browser restarts.
 */
const getStorageArea = (type: 'local' | 'session' = 'session') => {
    return type === 'session' ? chrome.storage.session : chrome.storage.local;
};

export const storage = {
    /**
     * Get a value from storage.
     */
    async get<T>(key: string, type: 'local' | 'session' = 'session'): Promise<T | null> {
        try {
            const result = await getStorageArea(type).get(key);
            return (result[key] as T) || null;
        } catch (e) {
            console.error(`Storage error getting ${key}:`, e);
            return null;
        }
    },

    /**
     * Set a value in storage.
     */
    async set(key: string, value: any, type: 'local' | 'session' = 'session'): Promise<void> {
        try {
            await getStorageArea(type).set({ [key]: value });
        } catch (e) {
            console.error(`Storage error setting ${key}:`, e);
        }
    },

    /**
     * Remove a key from storage.
     */
    async remove(key: string, type: 'local' | 'session' = 'session'): Promise<void> {
        try {
            await getStorageArea(type).remove(key);
        } catch (e) {
            console.error(`Storage error removing ${key}:`, e);
        }
    },

    /**
     * Clear all session data (logout/lock).
     */
    async clearSession(): Promise<void> {
        try {
            await chrome.storage.session.clear();
        } catch (e) {
            console.error('Storage error clearing session:', e);
        }
    }
};
