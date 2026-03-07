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

/**
 * Robust detection of login forms on the page.
 */
const detectLoginFields = (): boolean => {
    // Priority 1: Existence of password fields
    if (document.querySelectorAll("input[type='password']").length > 0) return true;

    // Priority 2: Common login-related keywords in IDs, Names, or Placeholders
    const loginKeywords = ["login", "signin", "user_name", "username", "email", "passwd", "password", "credential"];
    const inputs = document.querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='checkbox']):not([type='radio'])");

    for (const input of Array.from(inputs)) {
        const el = input as HTMLInputElement;
        const attributes = [
            el.id,
            el.name,
            el.placeholder,
            el.className,
            el.getAttribute("aria-label") || "",
            el.getAttribute("autocomplete") || ""
        ].map(s => s?.toLowerCase() || "");

        if (loginKeywords.some(keyword => attributes.some(attr => attr.includes(keyword)))) {
            return true;
        }
    }

    // Priority 3: Form-level hints
    const formSymbols = ["login", "signin", "auth", "account"];
    const forms = document.querySelectorAll("form");
    for (const form of Array.from(forms)) {
        const attributes = [form.id, form.name, form.action, form.className].map(s => s?.toLowerCase() || "");
        if (formSymbols.some(symbol => attributes.some(attr => attr.includes(symbol)))) {
            if (form.querySelectorAll("input:not([type='hidden'])").length > 0) {
                return true;
            }
        }
    }

    return false;
};

// Handle extension messages
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "FORCE_AUTOFILL") {
        executeAutofill(request.payload);
        sendResponse?.({ success: true });
    } else if (request.action === "CHECK_FOR_FORM") {
        sendResponse?.({ hasForm: detectLoginFields() });
    }
    return true;
});

// Auto-show popup if credentials exist and it's a login page
const p = () => {
    if (window.location.protocol.startsWith("http")) {
        chrome.runtime.sendMessage({
            action: "GET_CREDENTIALS",
            hostname: window.location.hostname
        }, (response) => {
            if (response?.credentials?.length > 0 && detectLoginFields()) {
                chrome.runtime.sendMessage({
                    action: "OPEN_AUTO_POPUP",
                    hostname: window.location.hostname
                });
            }
        });
    }
};

p();
initAutosave();

