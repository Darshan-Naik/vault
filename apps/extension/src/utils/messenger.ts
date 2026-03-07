import { ExtensionAction } from '../types/actions';

/**
 * Send a message to the background script.
 * Returns a promise that resolves with the background script's response.
 */
export async function sendMessage<T = any>(action: ExtensionAction, payload?: any, hostname?: string): Promise<T> {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action, payload, hostname }, (response) => {
            if (chrome.runtime.lastError) {
                console.warn(`Messaging error [${action}]:`, chrome.runtime.lastError);
                return resolve(null as any);
            }
            resolve(response);
        });
    });
}

/**
 * Handle responses from common actions.
 */
export const messenger = {
    getSessionState: () => sendMessage(ExtensionAction.GET_SESSION_STATE),
    getCredentials: (hostname: string) => sendMessage(ExtensionAction.GET_CREDENTIALS, null, hostname),
    getAllVaults: () => sendMessage(ExtensionAction.GET_ALL_VAULTS),
    lockVault: () => sendMessage(ExtensionAction.SYNC_VAULT_LOCK),
    unlockVault: (masterKey: string) => sendMessage(ExtensionAction.SYNC_VAULT_UNLOCK, { masterKey }),
    unlockAndGet: (payload: { masterPassword: string, hostname: string }) =>
        sendMessage(ExtensionAction.UNLOCK_AND_GET_CREDENTIAL, payload),
    saveCredential: (payload: any) => sendMessage(ExtensionAction.SAVE_CREDENTIAL, payload),
    clearPendingSave: () => sendMessage(ExtensionAction.CLEAR_PENDING_SAVE),
    syncUserAuth: (payload: { userJson: any, apiKey: string }) =>
        sendMessage(ExtensionAction.SYNC_USER_AUTH, payload),
    syncUserLogout: () => sendMessage(ExtensionAction.SYNC_USER_LOGOUT)
};
