export const openAutoPopup = (senderTabId: number, hostname: string) => {
    const popupUrl = `index.html?mode=popup&tabId=${senderTabId}&hostname=${encodeURIComponent(hostname)}`;

    const openStandalone = () => {
        chrome.windows.create({
            url: chrome.runtime.getURL(popupUrl),
            type: 'popup',
            width: 320,
            height: 320,
            top: 250,
            left: 250,
            focused: true
        });
    };

    // Try to open the actual extension popup first
    if (chrome.action && (chrome.action as any).openPopup) {
        // Set the popup for THIS tab temporarily to include the parameters
        chrome.action.setPopup({ tabId: senderTabId, popup: popupUrl }, () => {
            try {
                (chrome.action as any).openPopup(() => {
                    const lastErr = chrome.runtime.lastError;
                    // Reset to default after a delay or on next tick
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
