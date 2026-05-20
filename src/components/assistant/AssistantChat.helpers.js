export const FALLBACK_QUICK_PROMPTS = [
    "Начать первичную настройку",
    "Что на этой странице?",
    "Как создать заказ?",
    "Где найти клиента?",
    "Как работать со складом?",
];

export const DAILY_QUICK_PROMPTS = [
    "Что проверить в отчете смены?",
    "Быстро пройтись по разделам",
    "Как внести расход или зарплату?",
    "Как проверить способ оплаты?",
    "Как выйти из смены?",
];

const GREETING_STORAGE_KEY = "assistantGreeting";

const escapeRegExp = value => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const normalizeAssistantRoute = value => {
    const route = String(value || "")
        .replace(/^https?:\/\/[^/]+/i, "")
        .split("#")[0]
        .split("?")[0]
        .replace(/\/+$/, "");

    return route || "/";
};

const getTodayKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getGreetingStorageKey = userId => (
    `${GREETING_STORAGE_KEY}:${userId || "guest"}`
);

const readGreetingState = userId => {
    try {
        return JSON.parse(window.localStorage.getItem(getGreetingStorageKey(userId)) || "{}");
    } catch (error) {
        return {};
    }
};

const saveGreetingState = (userId, state) => {
    try {
        window.localStorage.setItem(getGreetingStorageKey(userId), JSON.stringify(state));
    } catch (error) {
        // Greeting memory is a convenience; chat should still work if storage is unavailable.
    }
};

export const stripAssistantGreeting = (text, assistantName = "") => {
    const assistantPattern = assistantName ? `(?:,\\s*я\\s+${escapeRegExp(assistantName)})?` : "(?:,\\s*я\\s+[^.]+)?";

    return String(text || "")
        .replace(new RegExp(`^\\s*Здравствуйте${assistantPattern}\\.?\\s*`, "i"), "")
        .replace(/^\s*Я помогу быстрее освоиться в приложении\.\s*/i, "")
        .trim();
};

export const getDailyAssistantIntro = (assistantName, app = {}) => {
    const currentStockId = app.current_stock_id;
    const stock = (app.stocks || []).find(item => +item.id === +currentStockId);
    const daily = (app.daily || []).find(item => +item.stock_id === +currentStockId);
    const stockText = stock?.name ? `Точка «${stock.name}»` : "Точка";

    if (!currentStockId) {
        return (
            "Вы открыли раздел «Ежедневный отчет». Здесь ведется отчет по смене: сотрудники, предоплаты, товары, работы, расходы, подотчеты и итоги дня. " +
            "Сначала выберите рабочую точку в шапке приложения. После выбора точки можно будет открыть смену и работать с отчетом."
        );
    }

    if (!daily) {
        return (
            `Вы открыли раздел «Ежедневный отчет». ${stockText} уже выбрана. ` +
            "Здесь отображаются сотрудники смены, операции за день и итоговые суммы. Если смена еще не открыта, начните ее в шапке приложения."
        );
    }

    return (
        `Вы открыли раздел «Ежедневный отчет». ${stockText} выбрана, по ней уже есть отчет за выбранный день. ` +
        "Проверьте сотрудников, предоплаты для предзаказов товара или услуги, товары, работы и услуги, расходы, зарплату, подотчеты и способы оплаты. " +
        "Внизу проверьте итоговые суммы: остаток на утро, выручку, подотчеты, безналичные оплаты, сданную сумму и остаток. " +
        "Если ваша смена открыта и работа закончена, используйте кнопку «Выйти» в меню пользователя."
    );
};

export const getDailySectionWalkthrough = () => (
    "Коротко по разделам страницы.\n\n" +
    "Предоплаты нужны для предзаказов товаров или услуг. Нажмите плюс в разделе предоплат и заполните наименование, сумму предоплаты, итоговую стоимость, данные заказчика и примечание, если оно нужно. В этом же окне можно распечатать договор. Актуальные предоплаты хранятся в /prepaids.\n\n" +
    "Товары - раздел для товарных операций. Здесь можно добавить товар, продать ТМЦ со склада или провести продажу через сканер штрих-кодов.\n\n" +
    "Работы, услуги - здесь отображаются сегодняшние оплаты по заказам и услугам. Услугу можно добавить через плюс, оплату можно принять при создании нового заказа на /order или внутри заказа на вкладке платежей.\n\n" +
    "Расходы, зарплата - раздел для расходов, которые не относятся к себестоимости, и выплат зарплаты сотрудникам. Чтобы списать сумму из кассы, нажмите плюс и заполните форму.\n\n" +
    "Подотчеты - временный учет денег, выданных под отчет. Запись закрывают после того, как подотчетное лицо отчитается."
);

const DAILY_VIDEO_STORY = {
    title: "Ежедневный отчет",
    duration: 40,
    scenes: [
        {
            title: "Предоплаты",
            caption: "Предзаказы товаров и услуг: сумма предоплаты, итоговая стоимость, данные заказчика и договор.",
            accent: "Предзаказ",
        },
        {
            title: "Товары",
            caption: "Добавление товара, продажа ТМЦ со склада и продажа через сканер штрих-кодов.",
            accent: "Склад",
        },
        {
            title: "Работы, услуги",
            caption: "Сегодняшние оплаты по заказам и услугам: через плюс, новый заказ или вкладку платежей.",
            accent: "Оплата",
        },
        {
            title: "Расходы, зарплата",
            caption: "Расходы вне себестоимости и выплаты сотрудникам списываются из кассы через плюс.",
            accent: "Касса",
        },
        {
            title: "Подотчеты",
            caption: "Временный учет денег под отчет до момента, когда подотчетное лицо отчитается.",
            accent: "Контроль",
        },
    ],
};

export const getPageVideoStory = currentPath => {
    if (normalizeAssistantRoute(currentPath) === "/daily") {
        return DAILY_VIDEO_STORY;
    }

    return null;
};

const pageIntroOverrides = {
    "/settings/employees": () => (
        "Вы открыли раздел «Сотрудники». На этой странице можно управлять сотрудниками организации: искать сотрудников, " +
        "назначать должности, менять статус, добавлять новые должности и регулировать полномочия для каждой должности."
    ),
    "/daily": (assistantName, app) => getDailyAssistantIntro(assistantName, app),
};

export const getPageIntroOverride = (currentPath, assistantName, app) => {
    const override = pageIntroOverrides[normalizeAssistantRoute(currentPath)];

    return typeof override === "function" ? override(assistantName, app) : override;
};

export const resolveQuickPrompts = (currentPath, backendQuickPrompts = []) => {
    if (normalizeAssistantRoute(currentPath) === "/daily") {
        return DAILY_QUICK_PROMPTS;
    }

    return Array.isArray(backendQuickPrompts) && backendQuickPrompts.length
        ? backendQuickPrompts
        : FALLBACK_QUICK_PROMPTS;
};

export const buildAssistantIntro = ({
    assistantName,
    currentPath,
    userId,
    app = {},
    backendIntro = "",
}) => {
    const state = readGreetingState(userId);
    const today = getTodayKey();
    const body = stripAssistantGreeting(
        getPageIntroOverride(currentPath, assistantName, app) || backendIntro || (
            "Спросите, что нужно сделать, или напишите: `что на этой странице?`."
        ),
        assistantName
    );

    const hasIntroduced = !!state.introduced;
    const hasGreetedToday = state.greetedDate === today;
    const prefix = hasIntroduced
        ? (hasGreetedToday ? "" : "Здравствуйте. ")
        : `Здравствуйте, я ${assistantName}. `;

    saveGreetingState(userId, {
        ...state,
        introduced: true,
        greetedDate: today,
    });

    return `${prefix}${body}`.replace(/\n{3,}/g, "\n\n").trim();
};
