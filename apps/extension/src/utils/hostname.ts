export const matchHostname = (savedUrl: string, targetHostname: string): boolean => {
    if (!savedUrl || !targetHostname) return false;
    try {
        let savedHostname = savedUrl;
        if (savedUrl.startsWith('http')) {
            savedHostname = new URL(savedUrl).hostname;
        }
        // Remove port numbers if present
        savedHostname = savedHostname.split(':')[0];
        const target = targetHostname.split(':')[0];

        return savedHostname.includes(target) || target.includes(savedHostname);
    } catch (e) {
        return String(savedUrl).includes(targetHostname) || targetHostname.includes(String(savedUrl));
    }
};
