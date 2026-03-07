import { db, decryptData } from '@vault/shared';
import { collection, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { state } from './state';

let unsubscribe: (() => void) | null = null;

/**
 * Starts a real-time sync with Firestore for the given user.
 * Automatically updates both encrypted and decrypted caches in the extension.
 */
export const startVaultSync = async (userId: string) => {
    // Prevent duplicate listeners
    if (unsubscribe) unsubscribe();

    const vaultCollection = collection(db, "vault-db");
    const userVaultsCollection = doc(vaultCollection, userId);
    const q = query(
        collection(userVaultsCollection, "vaults"),
        orderBy("createdAt", "asc")
    );

    console.log("Starting real-time vault sync for user:", userId);

    unsubscribe = onSnapshot(q, async (snapshot) => {
        const rawVaults = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));

        // Always update encrypted cache
        await state.setEncryptedVaults(rawVaults);

        // Update decrypted cache if master key is available
        const masterKey = await state.cachedMasterKey;
        if (masterKey) {
            const decrypted = rawVaults.map(v => decryptData(v, masterKey));
            await state.setVaults(decrypted);
            console.log("Vault cache updated from cloud sync");
        }
    }, (error) => {
        console.error("Vault sync error:", error);
    });
};

/**
 * Stops the real-time sync.
 */
export const stopVaultSync = () => {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }
};
