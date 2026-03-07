import { storage, STORAGE_KEYS } from "../utils/storage";

// BACKED BY STORAGE (Survives Worker Restart)
export const state = {
    get cachedMasterKey(): Promise<string | null> {
        return storage.get<string>(STORAGE_KEYS.MASTER_KEY, 'session');
    },
    async setMasterKey(key: string | null) {
        if (key) {
            await storage.set(STORAGE_KEYS.MASTER_KEY, key, 'session');
        } else {
            await storage.remove(STORAGE_KEYS.MASTER_KEY, 'session');
        }
    },
    get cachedVaults(): Promise<any[] | null> {
        return storage.get<any[]>(STORAGE_KEYS.DECRYPTED_VAULTS, 'session');
    },
    async setVaults(vaults: any[] | null) {
        if (vaults) {
            await storage.set(STORAGE_KEYS.DECRYPTED_VAULTS, vaults, 'session');
        } else {
            await storage.remove(STORAGE_KEYS.DECRYPTED_VAULTS, 'session');
        }
    },
    get encryptedVaults(): Promise<any[] | null> {
        return storage.get<any[]>(STORAGE_KEYS.ENCRYPTED_VAULTS, 'local');
    },
    async setEncryptedVaults(vaults: any[] | null) {
        if (vaults) {
            await storage.set(STORAGE_KEYS.ENCRYPTED_VAULTS, vaults, 'local');
        } else {
            await storage.remove(STORAGE_KEYS.ENCRYPTED_VAULTS, 'local');
        }
    },
    get pendingSave(): Promise<any | null> {
        return storage.get<any>(STORAGE_KEYS.PENDING_SAVE, 'session');
    },
    async setPendingSave(data: any | null) {
        if (data) {
            await storage.set(STORAGE_KEYS.PENDING_SAVE, data, 'session');
        } else {
            await storage.remove(STORAGE_KEYS.PENDING_SAVE, 'session');
        }
    }
};

export const clearCache = async () => {
    await storage.clearSession();
    await storage.remove(STORAGE_KEYS.ENCRYPTED_VAULTS, 'local');
};
