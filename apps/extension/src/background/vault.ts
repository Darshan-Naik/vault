import { getVaults, addVault, db, getUserMeta, unlockWithPassword } from '@vault/shared';
import { collection, getDocs, query, doc } from 'firebase/firestore';
import { matchHostname } from '../utils/hostname';
import { state } from './state';

export const handleGetCredentials = async (authUser: any, hostname: string) => {
    if (!authUser?.uid) return { credentials: [] };

    try {
        if (!state.cachedMasterKey) {
            const vaultCollection = collection(db, "vault-db");
            const userVaultsCollection = doc(vaultCollection, authUser.uid);
            const q = query(collection(userVaultsCollection, "vaults"));
            const querySnapshot = await getDocs(q);

            const matched = querySnapshot.docs
                .map(d => ({ ...d.data(), id: d.id } as any))
                .filter(v => v.type === "CREDENTIAL" && v.url && matchHostname(v.url, hostname))
                .map(v => ({
                    id: v.id,
                    title: v.title,
                    url: v.url,
                    isLocked: true
                }));

            return { credentials: matched };
        }

        if (!state.cachedVaults) {
            state.cachedVaults = await getVaults(authUser.uid, state.cachedMasterKey);
        }

        const matched = state.cachedVaults.filter((v: any) =>
            v.type === "CREDENTIAL" && v.url && matchHostname(v.url, hostname)
        );
        return { credentials: matched };
    } catch (e) {
        console.error("Error matching credentials:", e);
        return { credentials: [] };
    }
};

export const handleUnlockAndGetCredential = async (authUser: any, payload: any) => {
    const { masterPassword, hostname } = payload;
    if (!authUser?.uid) return { success: false, error: "Not logged in" };

    try {
        const userMeta = await getUserMeta(authUser.uid);
        if (!userMeta) return { success: false, error: "No user meta found" };

        const masterKey = await unlockWithPassword(userMeta, masterPassword);
        if (!masterKey) return { success: false, error: "Incorrect master password" };

        state.cachedMasterKey = masterKey;
        state.cachedVaults = await getVaults(authUser.uid, masterKey);

        const matched = state.cachedVaults.filter((v: any) =>
            v.type === "CREDENTIAL" && v.url && matchHostname(v.url, hostname)
        );

        return { success: true, credentials: matched };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

export const handleSaveCredential = async (authUser: any, payload: any) => {
    if (!authUser?.uid || !state.cachedMasterKey) return;

    try {
        await addVault({
            userId: authUser.uid,
            masterKey: state.cachedMasterKey,
            vaultData: payload
        });

        state.cachedVaults = await getVaults(authUser.uid, state.cachedMasterKey);

        chrome.notifications.create({
            type: "basic",
            iconUrl: "/pwa-192x192.png",
            title: "Vault AutoSave",
            message: `Saved credentials for ${payload.hostname || payload.title}`
        });
    } catch (e) {
        console.error("Failed to auto-save credential", e);
    }
};
