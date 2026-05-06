export const APP_SETTINGS_STORAGE_KEY = "appSettings";
export const APP_SETTINGS_CHANGE_EVENT = "app-settings-change";

export const defaultAppSettings = {
    assistantEnabled: true,
    fontSize: 16,
};

const clampFontSize = value => {
    const next = Number(value);
    if (!Number.isFinite(next)) return defaultAppSettings.fontSize;

    return Math.min(20, Math.max(14, next));
};

export const getAppSettings = () => {
    try {
        const stored = JSON.parse(window.localStorage.getItem(APP_SETTINGS_STORAGE_KEY));

        return {
            ...defaultAppSettings,
            ...stored,
            assistantEnabled: stored?.assistantEnabled !== false,
            fontSize: clampFontSize(stored?.fontSize),
        };
    } catch (e) {
        return defaultAppSettings;
    }
};

export const applyAppSettings = settings => {
    document.documentElement.style.fontSize = `${clampFontSize(settings.fontSize)}px`;
};

export const saveAppSettings = settings => {
    const nextSettings = {
        ...defaultAppSettings,
        ...settings,
        fontSize: clampFontSize(settings.fontSize),
    };

    window.localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
    applyAppSettings(nextSettings);
    window.dispatchEvent(new CustomEvent(APP_SETTINGS_CHANGE_EVENT, { detail: nextSettings }));

    return nextSettings;
};
