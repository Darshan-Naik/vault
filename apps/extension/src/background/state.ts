// RAM-ONLY STATE (Zero-Storage Security)
export interface BackgroundState {
    cachedMasterKey: string | null;
    cachedVaults: any[] | null;
}

export const state: BackgroundState = {
    cachedMasterKey: null,
    cachedVaults: null,
};

export const clearCache = () => {
    state.cachedMasterKey = null;
    state.cachedVaults = null;
};
