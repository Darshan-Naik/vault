import { ExtensionAction } from './types/actions';
import { getAuthUser, syncUserAuth, syncUserLogout } from './background/auth';
import { state, clearCache } from './background/state';
import { handleGetCredentials, handleUnlockAndGetCredential, handleSaveCredential } from './background/vault';
import { openAutoPopup, closePromptInTab } from './background/windows';

console.log("Vault Background script initialized");

// Start sync if user is already authenticated
getAuthUser().catch(console.error);

/**
 * Registry of handlers for extension messages.
 */
const Handlers: Record<string, (request: any, sender: chrome.runtime.MessageSender) => Promise<any>> = {
    [ExtensionAction.PING]: async () => ({ status: "ok" }),

    [ExtensionAction.SYNC_USER_AUTH]: async (req) => {
        return syncUserAuth(req.payload.userJson, req.payload.apiKey);
    },

    [ExtensionAction.SYNC_USER_LOGOUT]: async () => {
        return syncUserLogout();
    },

    [ExtensionAction.SYNC_VAULT_UNLOCK]: async (req) => {
        await state.setMasterKey(req.payload.masterKey);
        return { success: true };
    },

    [ExtensionAction.SYNC_VAULT_LOCK]: async () => {
        await clearCache();
        return { success: true };
    },

    [ExtensionAction.GET_SESSION_STATE]: async () => {
        const user = await getAuthUser();
        const masterKey = await state.cachedMasterKey;
        return {
            isAuth: !!user,
            isUnlocked: !!masterKey,
            auth: user ? { userId: user.uid, email: user.email } : { userId: null, email: null },
            session: { masterKey }
        };
    },

    [ExtensionAction.GET_CREDENTIALS]: async (req) => {
        const authUser = await getAuthUser();
        return handleGetCredentials(authUser, req.hostname || "");
    },

    [ExtensionAction.GET_ALL_VAULTS]: async () => {
        const vaults = await state.cachedVaults;
        return { vaults: vaults || [] };
    },

    [ExtensionAction.UNLOCK_AND_GET_CREDENTIAL]: async (req) => {
        const authUser = await getAuthUser();
        return handleUnlockAndGetCredential(authUser, req.payload);
    },

    [ExtensionAction.SAVE_CREDENTIAL]: async (req) => {
        const authUser = await getAuthUser();
        await handleSaveCredential(authUser, req.payload);
        const updated = await state.cachedVaults;
        return { success: true, vaults: updated };
    },

    [ExtensionAction.OPEN_SAVE_POPUP]: async (req, sender) => {
        await state.setPendingSave(req.payload);
        if (sender.tab?.id) {
            openAutoPopup(sender.tab.id, req.hostname, "save-prompt");
        }
        return { success: true };
    },

    [ExtensionAction.CLEAR_PENDING_SAVE]: async () => {
        await state.setPendingSave(null);
        return { success: true };
    },

    [ExtensionAction.OPEN_AUTO_POPUP]: async (req, sender) => {
        if (sender.tab?.id) {
            openAutoPopup(sender.tab.id, req.hostname);
        }
        return { success: true };
    },

    [ExtensionAction.CLOSE_PROMPT]: async (_req, sender) => {
        closePromptInTab(sender.tab?.id);
        return { success: true };
    },

    [ExtensionAction.PROMPT_READY]: async () => ({ success: true })
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const handler = Handlers[request.action];
    if (handler) {
        handler(request, sender)
            .then(sendResponse)
            .catch(err => {
                console.error(`Error in handler for ${request.action}:`, err);
                sendResponse({ success: false, error: err.message || String(err) });
            });
        return true; // Keep channel open for async response
    }
    return false;
});

