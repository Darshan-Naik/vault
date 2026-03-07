import { executeAutofill } from './content/autofill';
import { initAutosave } from './content/autosave';

console.log("Vault Content Script loaded:", window.location.href);

// 1. Sync User state from Web App if we are on the vault domain
window.addEventListener("message", (event) => {
    if (!event.data) return;

    switch (event.data.type) {
        case "USER_AUTHENTICATED":
            chrome.runtime.sendMessage({ action: "SYNC_USER_AUTH", payload: event.data.payload });
            break;
        case "USER_LOGGED_OUT":
            chrome.runtime.sendMessage({ action: "SYNC_USER_LOGOUT" });
            break;
        case "VAULT_UNLOCKED":
            chrome.runtime.sendMessage({ action: "SYNC_VAULT_UNLOCK", payload: event.data.payload });
            break;
        case "VAULT_LOCKED":
            chrome.runtime.sendMessage({ action: "SYNC_VAULT_LOCK" });
            break;
    }
});

// 2. Handle extension messages
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "FORCE_AUTOFILL") {
        executeAutofill(request.payload);
        if (sendResponse) sendResponse({ success: true });
    }
    return true;
});

// 3. Detect Login Fields & Trigger Auto-Popup
const detectAndNotify = () => {
    if (window.location.protocol.startsWith('http')) {
        chrome.runtime.sendMessage({
            action: "GET_CREDENTIALS",
            hostname: window.location.hostname
        }, (response) => {
            if (response?.credentials?.length > 0) {
                const loginInputs = document.querySelectorAll("input[type='password'], input[type='email']");
                if (loginInputs.length > 0) {
                    chrome.runtime.sendMessage({
                        action: "OPEN_AUTO_POPUP",
                        hostname: window.location.hostname
                    });
                }
            }
        });
    }
};

detectAndNotify();
initAutosave();

