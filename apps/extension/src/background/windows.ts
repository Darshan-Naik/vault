export const openAutoPopup = (senderTabId: number, hostname: string, mode: string = "popup") => {
    const popupUrl = `index.html?mode=${mode}&tabId=${senderTabId}&hostname=${encodeURIComponent(hostname)}`;

    const openStandalone = () => {
        // Increase height for save-prompt to fit buttons correctly
        const height = mode === 'save-prompt' ? 360 : 320;

        chrome.windows.create({
            url: chrome.runtime.getURL(popupUrl),
            type: 'popup',
            width: 320,
            height: height,
            // Position near the top-right of the screen
            top: 80,
            left: 1000,
            focused: true
        });
    };

    // For SAVE prompts, always use a standalone window. 
    // The toolbar action popup (chrome.action.openPopup) closes automatically on page reloads/navigation.
    if (mode === 'save-prompt') {
        openStandalone();
        return;
    }

    // For auto-fill prompts, try to use the toolbar popup first for a smoother UI experience
    if (chrome.action && (chrome.action as any).openPopup) {
        chrome.action.setPopup({ tabId: senderTabId, popup: popupUrl }, () => {
            try {
                (chrome.action as any).openPopup(() => {
                    const lastErr = chrome.runtime.lastError;
                    setTimeout(() => {
                        chrome.action.setPopup({ tabId: senderTabId, popup: 'index.html' });
                    }, 1000);

                    if (lastErr) {
                        openStandalone();
                    }
                });
            } catch (e) {
                chrome.action.setPopup({ tabId: senderTabId, popup: 'index.html' });
                openStandalone();
            }
        });
    } else {
        openStandalone();
    }
};

export const closePromptInTab = (tabId?: number) => {
    if (tabId) {
        chrome.tabs.sendMessage(tabId, { action: "CLOSE_PROMPT" });
    } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (tab?.id) {
                chrome.tabs.sendMessage(tab.id, { action: "CLOSE_PROMPT" });
            }
        });
    }
};
