const buildStorageKey = (provider, scope = "default") => `oauth_social_state_${provider}_${scope}`;

export const storeSocialState = (provider, state, scope = "default") => {
    if (!provider || !state || typeof window === "undefined") return;

    try {
        window.sessionStorage.setItem(buildStorageKey(provider, scope), state);
    } catch (e) {
        // Ignore storage access issues to avoid breaking auth flows.
    }
};

export const readSocialState = (provider, scope = "default") => {
    if (!provider || typeof window === "undefined") return "";

    try {
        return window.sessionStorage.getItem(buildStorageKey(provider, scope)) || "";
    } catch (e) {
        return "";
    }
};

export const clearSocialState = (provider, scope = "default") => {
    if (!provider || typeof window === "undefined") return;

    try {
        window.sessionStorage.removeItem(buildStorageKey(provider, scope));
    } catch (e) {
        // Ignore storage access issues to avoid breaking auth flows.
    }
};
