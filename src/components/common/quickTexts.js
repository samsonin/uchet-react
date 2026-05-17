export const emptyQuickTexts = {
    orders: {
        models: [],
        defects: [],
        works: [],
    },
    sales: {
        items: [],
        notes: [],
        expenses: [],
    },
    goods: {
        models: [],
        private_notes: [],
        public_notes: [],
        storage_places: [],
    },
    jobs: {
        services: [],
        costs: [],
    },
    warranty: {
        models: [],
        defects: [],
    },
    preorders: {
        items: [],
        notes: [],
    },
    pool: [],
};

export const quickTextLabels = {
    orders: {
        models: "Модели заказов",
        defects: "Неисправности",
        works: "Выполненные работы",
    },
    sales: {
        items: "Продажи и операции",
        expenses: "Расходы",
    },
    goods: {
        models: "Товары",
    },
    jobs: {
        services: "Работы и услуги",
    },
    warranty: {
        defects: "Гарантийные неисправности",
    },
    preorders: {
        items: "Предзаказы",
    },
    pool: "Все быстрые вводы",
};

const getByPath = (source, path) => String(path || "")
    .split(".")
    .filter(Boolean)
    .reduce((current, key) => current?.[key], source);

export const getQuickTextOptions = (quickTexts, path) => {
    const items = getByPath(quickTexts || emptyQuickTexts, path);

    if (!Array.isArray(items)) return [];

    return items
        .map(item => String(item?.text || "").trim())
        .filter(Boolean);
};

export const getQuickTextLabel = path => getByPath(quickTextLabels, path) || "Быстрые вводы";
