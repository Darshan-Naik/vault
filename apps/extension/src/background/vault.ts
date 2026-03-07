import { getVaults, addVault, getRawVaults, getUserMeta, unlockWithPassword, decryptData } from '@vault/shared';
import { matchHostname } from '../utils/hostname';
import { state } from './state';

export const handleGetCredentials = async (authUser: any, hostname: string) => {
    if (!authUser?.uid) return { credentials: [] };

    try {
        const cachedMasterKey = await state.cachedMasterKey;
        const cachedVaults = await state.cachedVaults;

        // 1. If we have decrypted vaults, use them
        if (cachedVaults) {
            const matched = cachedVaults.filter((v: any) =>
                v.type === "CREDENTIAL" && v.url && matchHostname(v.url, hostname)
            );
            return { credentials: matched };
        }

        // 2. If we have the master key but no decrypted vaults (worker restart), 
        // try to decrypt from local encrypted cache
        if (cachedMasterKey) {
            const encryptedVaults = await state.encryptedVaults;
            if (encryptedVaults) {
                const decrypted = encryptedVaults.map(v => decryptData(v, cachedMasterKey));
                await state.setVaults(decrypted);
                const matched = decrypted.filter((v: any) =>
                    v.type === "CREDENTIAL" && v.url && matchHostname(v.url, hostname)
                );
                return { credentials: matched };
            }

            // Fallback: Fetch from Firestore and cache
            const vaults = await getVaults(authUser.uid, cachedMasterKey);
            await state.setVaults(vaults);

            // Also update raw cache
            const raw = await getRawVaults(authUser.uid);
            await state.setEncryptedVaults(raw);

            const matched = vaults.filter((v: any) =>
                v.type === "CREDENTIAL" && v.url && matchHostname(v.url, hostname)
            );
            return { credentials: matched };
        }

        // 3. Not unlocked: Show locked placeholders from local raw cache or Firestore
        let rawVaults = await state.encryptedVaults;
        if (!rawVaults) {
            rawVaults = await getRawVaults(authUser.uid);
            await state.setEncryptedVaults(rawVaults);
        }

        const matched = rawVaults
            .filter((v: any) => v.type === "CREDENTIAL" && v.url && matchHostname(v.url, hostname))
            .map((v: any) => ({
                id: v.id,
                title: v.title,
                url: v.url,
                isLocked: true
            }));

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

        await state.setMasterKey(masterKey);

        // Fetch and cache decrypted and encrypted versions
        const vaults = await getVaults(authUser.uid, masterKey);
        await state.setVaults(vaults);

        const raw = await getRawVaults(authUser.uid);
        await state.setEncryptedVaults(raw);

        const matched = vaults.filter((v: any) =>
            v.type === "CREDENTIAL" && v.url && matchHostname(v.url, hostname)
        );

        return { success: true, credentials: matched };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

export const handleSaveCredential = async (authUser: any, payload: any) => {
    const cachedMasterKey = await state.cachedMasterKey;
    if (!authUser?.uid || !cachedMasterKey) return;

    try {
        await addVault({
            userId: authUser.uid,
            masterKey: cachedMasterKey,
            vaultData: payload
        });

        // Update caches
        const vaults = await getVaults(authUser.uid, cachedMasterKey);
        await state.setVaults(vaults);

        const raw = await getRawVaults(authUser.uid);
        await state.setEncryptedVaults(raw);

        // Clear pending save
        await state.setPendingSave(null);

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
