export const ONBOARDING_STORAGE_KEY = "assistantOnboarding";
export const ONBOARDING_CHANGE_EVENT = "assistant-onboarding-change";

const getOnboardingStorageKey = userId => (
    `${ONBOARDING_STORAGE_KEY}:${userId || "guest"}`
);

const notifyOnboardingChange = (userId, progress) => {
    window.dispatchEvent(new CustomEvent(ONBOARDING_CHANGE_EVENT, {
        detail: {
            userId,
            progress,
        },
    }));
};

export const firstSetupScenario = {
    id: "first_setup",
    title: "Первичная настройка",
    description: "Помогу подготовить организацию, сотрудников и торговую точку к работе.",
    steps: [
        {
            id: "organization",
            title: "Заполнить данные организации",
            path: "/settings/organization",
            intro: "Здравствуйте! Спасибо, что пользуетесь нашим сервисом. Начнем с юридических данных вашей организации: они будут использоваться в документах, печати и заказах.",
            checklist: [
                { text: "Откройте страницу организации.", to: "/settings/organization", label: "Открыть организацию" },
                { text: "Введите ИНН организации." },
                { text: "Проверьте автоматически подгруженные юридические данные." },
                { text: "Введите БИК банковского счета." },
                { text: "Проверьте автоматически подгруженные банковские реквизиты." },
                { text: "Нажмите «Сохранить»." },
            ],
        },
        {
            id: "invites",
            title: "Пригласить сотрудников",
            path: "/settings/invites",
            intro: "Теперь добавим сотрудников в вашу организацию через приглашения.",
            checklist: [
                { text: "Откройте страницу приглашений.", to: "/settings/invites", label: "Открыть приглашения" },
                { text: "Создайте новое приглашение.", to: "/settings/invites?new=1", label: "+" },
                { text: "Введите имя будущего сотрудника." },
                { text: "Выберите тип контакта." },
                { text: "Укажите e-mail, номер телефона или другой контакт." },
                { text: "Выберите должность сотрудника." },
                { text: "Сохраните приглашение." },
            ],
            note: "Когда сотрудник войдет в приложение по указанному e-mail или номеру телефона, он сможет присоединиться к вашей организации по этому приглашению.",
        },
        {
            id: "stock",
            title: "Настроить торговую точку",
            path: "/settings/stocks",
            intro: "После приглашения сотрудников настройте торговую точку и доступы к ней.",
            checklist: [
                { text: "Откройте страницу точек.", to: "/settings/stocks", label: "Открыть точки" },
                { text: "Создайте новую точку или откройте существующую.", action: "Создать / открыть точку" },
                { text: "Измените название торговой точки." },
                { text: "Заполните адрес." },
                { text: "Укажите контактный номер телефона." },
                { text: "В настройках точки выберите сотрудников, которым разрешено работать с этой точкой." },
                { text: "Сохраните изменения." },
            ],
        },
    ],
};

export const getOnboardingProgress = userId => {
    try {
        const stored = JSON.parse(window.localStorage.getItem(getOnboardingStorageKey(userId)));

        return {
            completed: Array.isArray(stored?.completed) ? stored.completed : [],
            dismissed: !!stored?.dismissed,
        };
    } catch (e) {
        return {
            completed: [],
            dismissed: false,
        };
    }
};

export const saveOnboardingProgress = (progress, userId) => {
    const nextProgress = {
        completed: Array.isArray(progress.completed) ? progress.completed : [],
        dismissed: !!progress.dismissed,
    };

    window.localStorage.setItem(getOnboardingStorageKey(userId), JSON.stringify(nextProgress));
    notifyOnboardingChange(userId, nextProgress);

    return nextProgress;
};

export const resetOnboardingProgress = userId => saveOnboardingProgress({
    completed: [],
    dismissed: false,
    restartedAt: Date.now(),
}, userId);

export const getCurrentOnboardingStep = progress => (
    firstSetupScenario.steps.find(step => !progress.completed.includes(step.id)) || null
);

export const completeOnboardingStep = (progress, stepId, userId) => saveOnboardingProgress({
    ...progress,
    completed: progress.completed.includes(stepId)
        ? progress.completed
        : [...progress.completed, stepId],
}, userId);

export const dismissOnboarding = (progress, userId) => saveOnboardingProgress({
    ...progress,
    dismissed: true,
}, userId);
