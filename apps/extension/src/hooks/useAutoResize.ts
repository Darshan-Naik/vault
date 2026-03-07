import { useLayoutEffect, useMemo } from 'react';
import { WINDOW_CONFIG } from '../background/config';

export const useAutoResize = (dependencies: any[]) => {
    const isStandaloneMode = useMemo(() => {
        const mode = new URLSearchParams(window.location.search).get('mode');
        return mode === 'popup' || mode === 'save-prompt';
    }, []);

    useLayoutEffect(() => {
        if (!isStandaloneMode) return;

        const resizeWindow = () => {
            const height = document.body.scrollHeight;
            chrome.windows.getCurrent((win) => {
                if (win.id && win.type === 'popup') {
                    chrome.windows.update(win.id, {
                        height: height + WINDOW_CONFIG.RESIZE_BUFFER
                    });
                }
            });
        };

        // Create an observer to catch any content height changes
        const observer = new ResizeObserver(() => {
            resizeWindow();
        });

        observer.observe(document.body);

        // Initial resize
        resizeWindow();

        return () => observer.disconnect();
    }, [isStandaloneMode, ...dependencies]);
};
