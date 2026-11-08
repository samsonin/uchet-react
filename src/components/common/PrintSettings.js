const PRINT_SETTINGS_STORAGE_PREFIX = "uchet-print-settings-";
const PRICE_TAG_SIZE_VERSION = 1;

export const PRINT_PRESETS = {
    a4: {
        label: "A4",
        size: "A4",
        width: 210,
        height: 297,
    },
    a5: {
        label: "A5",
        size: "A5",
        width: 148,
        height: 210,
    },
    custom: {
        label: "Произвольный",
        size: "custom",
    },
};

export const DEFAULT_PRINT_SETTINGS = {
    document: {
        preset: "a4",
        orientation: "portrait",
        width: 210,
        height: 297,
        margin: 0,
    },
    receipt: {
        preset: "custom",
        orientation: "portrait",
        width: 57,
        height: 297,
        margin: 0,
    },
    priceTag: {
        preset: "custom",
        orientation: "portrait",
        width: 40,
        height: 50,
        margin: 0,
    },
    barcode: {
        preset: "custom",
        orientation: "portrait",
        width: 20,
        height: 30,
        margin: 0,
    },
};

const getStorageKey = type => PRINT_SETTINGS_STORAGE_PREFIX + type;

export const toPrintNumber = (value, fallback) => {
    const number = Number(value);

    return Number.isFinite(number) && number >= 0
        ? number
        : fallback;
};

export const getDefaultPrintSettings = type => ({
    ...DEFAULT_PRINT_SETTINGS[type],
});

export const getSavedPrintSettings = type => {
    const defaults = getDefaultPrintSettings(type);

    try {
        const saved = JSON.parse(localStorage.getItem(getStorageKey(type)) || "null");

        const settings = {
            ...defaults,
            ...(saved || {}),
        };
        if (type === "priceTag" && !settings.sizeVersion && settings.preset === "custom") {
            const width = Number(settings.width);
            const height = Number(settings.height);
            const isOldSize = (width === 40 && height === 30) || (width === 30 && height === 40);

            if (isOldSize) {
                return { ...defaults, margin: settings.margin };
            }
        }
        return settings;
    } catch (error) {
        return defaults;
    }
};

export const savePrintSettings = (type, settings) => {
    const defaults = getDefaultPrintSettings(type);
    const normalized = {
        preset: settings.preset || defaults.preset,
        orientation: settings.orientation || defaults.orientation,
        width: toPrintNumber(settings.width, defaults.width),
        height: toPrintNumber(settings.height, defaults.height),
        margin: toPrintNumber(settings.margin, defaults.margin),
        ...(type === "priceTag" ? { sizeVersion: PRICE_TAG_SIZE_VERSION } : {}),
    };

    try {
        localStorage.setItem(getStorageKey(type), JSON.stringify(normalized));
    } catch (error) {
        // Printing should not fail because localStorage is unavailable.
    }

    return normalized;
};

export const getPrintPageDimensions = settings => {
    const preset = PRINT_PRESETS[settings.preset];
    const width = preset && preset.size !== "custom"
        ? preset.width
        : settings.width;
    const height = preset && preset.size !== "custom"
        ? preset.height
        : settings.height;

    if (settings.orientation === "landscape") {
        return {
            width: height,
            height: width,
        };
    }

    return {
        width,
        height,
    };
};

export const getPrintPageSize = settings => {
    const preset = PRINT_PRESETS[settings.preset];

    if (preset && preset.size !== "custom") {
        return `${preset.size} ${settings.orientation}`;
    }

    const dimensions = getPrintPageDimensions(settings);

    return `${dimensions.width}mm ${dimensions.height}mm`;
};

export const getPrintPageStyle = settings => `
    @media print {
        @page {
            size: ${getPrintPageSize(settings)};
            margin: ${settings.margin}mm;
        }
    }
`;
