import { getAuthUser, syncUserAuth, syncUserLogout } from './background/auth';
import { state, clearCache } from './background/state';
import { handleGetCredentials, handleUnlockAndGetCredential, handleSaveCredential } from './background/vault';
import { openAutoPopup, closePromptInTab } from './background/windows';

console.log("Vault Background script initialized");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "ping") {
        sendResponse({ status: "ok" });
    } else if (request.action === "SYNC_USER_AUTH") {
        syncUserAuth(request.payload.userJson, request.payload.apiKey).then(success => sendResponse({ success }));
        return true;
    } else if (request.action === "SYNC_USER_LOGOUT") {
        syncUserLogout().then(success => sendResponse({ success }));
        return true;
    } else if (request.action === "SYNC_VAULT_UNLOCK") {
        state.cachedMasterKey = request.payload.masterKey;
        sendResponse({ success: true });
    } else if (request.action === "SYNC_VAULT_LOCK") {
        clearCache();
        sendResponse({ success: true });
    } else if (request.action === "GET_SESSION_STATE") {
        getAuthUser().then((user) => {
            sendResponse({
                isAuth: !!user,
                isUnlocked: !!state.cachedMasterKey,
                auth: user ? { userId: user.uid, email: user.email } : { userId: null, email: null },
                session: { masterKey: state.cachedMasterKey }
            });
        });
        return true;
    } else if (request.action === "GET_CREDENTIALS") {
        getAuthUser().then(async (authUser) => {
            const result = await handleGetCredentials(authUser, request.hostname || "");
            sendResponse(result);
        });
        return true;
    } else if (request.action === "UNLOCK_AND_GET_CREDENTIAL") {
        getAuthUser().then(async (authUser) => {
            const result = await handleUnlockAndGetCredential(authUser, request.payload);
            sendResponse(result);
        });
        return true;
    } else if (request.action === "SAVE_CREDENTIAL") {
        getAuthUser().then(async (authUser) => {
            await handleSaveCredential(authUser, request.payload);
            sendResponse({ success: true });
        });
        return true;
    } else if (request.action === "OPEN_AUTO_POPUP") {
        if (sender.tab?.id) {
            openAutoPopup(sender.tab.id, request.hostname);
        }
        sendResponse({ success: true });
    } else if (request.action === "CLOSE_PROMPT") {
        closePromptInTab(sender.tab?.id);
        sendResponse({ success: true });
    } else if (request.action === "PROMPT_READY") {
        sendResponse({ success: true });
    }
    return false;
});

