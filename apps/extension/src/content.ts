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

// 2. Detection Utility
const detectLoginFields = () => {
    // Priority 1: Existence of password fields
    const passwordFields = document.querySelectorAll("input[type='password']");
    if (passwordFields.length > 0) return true;

    // Priority 2: Common login-related keywords in IDs, Names, or Placeholders
    const loginKeywords = ['login', 'signin', 'user_name', 'username', 'email', 'passwd', 'password', 'credential'];
    const inputs = document.querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='checkbox']):not([type='radio'])");

    for (const input of Array.from(inputs) as HTMLInputElement[]) {
        const attributes = [
            input.id,
            input.name,
            input.placeholder,
            input.className,
            input.getAttribute('aria-label') || '',
            input.getAttribute('autocomplete') || ''
        ].map(s => s?.toLowerCase() || '');

        if (loginKeywords.some(keyword => attributes.some(attr => attr.includes(keyword)))) {
            return true;
        }
    }

    // Priority 3: Form-level hints
    const symbols = ['login', 'signin', 'auth', 'account'];
    const forms = document.querySelectorAll("form");
    for (const form of Array.from(forms)) {
        const formAttributes = [form.id, form.name, form.action, form.className].map(s => s?.toLowerCase() || '');
        if (symbols.some(symbol => formAttributes.some(attr => attr.includes(symbol)))) {
            // If the form looks like a login form, check if it has any text-like inputs
            if (form.querySelectorAll("input:not([type='hidden'])").length > 0) {
                return true;
            }
        }
    }

    return false;
};


// 3. Handle extension messages
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "FORCE_AUTOFILL") {
        executeAutofill(request.payload);
        if (sendResponse) sendResponse({ success: true });
    } else if (request.action === "CHECK_FOR_FORM") {
        sendResponse({ hasForm: detectLoginFields() });
    }
    return true;
});

// 4. Detect & Notify
const detectAndNotify = () => {
    if (window.location.protocol.startsWith('http')) {
        chrome.runtime.sendMessage({
            action: "GET_CREDENTIALS",
            hostname: window.location.hostname
        }, (response) => {
            if (response?.credentials?.length > 0) {
                if (detectLoginFields()) {
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

