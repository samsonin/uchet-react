import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";

import AssistantBadge from "./AssistantBadge";
import { getAssistantForUserName } from "./assistants";
import rest from "../Rest";
import { getAppSettings, saveAppSettings } from "../Settings/appSettingsStore";
import {
    completeOnboardingStep,
    dismissOnboarding,
    firstSetupScenario,
    getCurrentOnboardingStep,
    getOnboardingProgress,
    ONBOARDING_CHANGE_EVENT,
    resetOnboardingProgress,
} from "./onboarding";

const FALLBACK_QUICK_PROMPTS = [
    "Начать первичную настройку",
    "Что на этой странице?",
    "Как создать заказ?",
    "Где найти клиента?",
    "Как работать со складом?",
];

const getAssistantErrorReply = () => (
    "Не получилось получить ответ от backend. Попробуйте еще раз чуть позже."
);

const createAssistantMessage = content => ({
    role: "assistant",
    content,
    createdAt: Date.now(),
});

const createUserMessage = content => ({
    role: "user",
    content,
    createdAt: Date.now(),
});

const getDailyAssistantIntro = (assistantName, app = {}) => {
    const currentStockId = app.current_stock_id;
    const stock = (app.stocks || []).find(item => +item.id === +currentStockId);
    const daily = (app.daily || []).find(item => +item.stock_id === +currentStockId);

    if (!currentStockId) {
        return (
            `Здравствуйте, я ${assistantName}. Вижу, что вы открыли раздел «Ежедневный отчет».\n\n` +
            "Здесь ведется отчет по смене: сотрудники, предоплаты, товары, работы, расходы, подотчеты и итоги дня. Сначала выберите рабочую точку, после этого можно будет работать с отчетом смены."
        );
    }

    if (!daily) {
        return (
            `Здравствуйте, я ${assistantName}. Вижу, что вы открыли раздел «Ежедневный отчет».\n\n` +
            `Точка${stock?.name ? ` «${stock.name}»` : ""} уже выбрана. В этом разделе отображаются сотрудники смены, операции за день и итоговые суммы. Если смена еще не открыта, начните ее в шапке приложения.`
        );
    }

    return (
        `Здравствуйте, я ${assistantName}. Вижу, что вы открыли раздел «Ежедневный отчет».\n\n` +
        `Точка${stock?.name ? ` «${stock.name}»` : ""} выбрана, смена уже открыта. Здесь можно проверить сотрудников смены, предоплаты, продажи, работы и услуги, расходы, подотчеты, способы оплаты и итоговые суммы за день.`
    );
};

const normalizePromptText = value => String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[?.!]+$/g, "");

const getLocalAssistantReply = (content, currentPath, app = {}, assistantName = "") => {
    const prompt = normalizePromptText(content);

    if (/^где\s+найти\s+клиент/.test(prompt)) {
        return (
            "Клиентов нужно искать в разделе «Физические лица» на странице /customers. " +
            "Перейдите туда и воспользуйтесь поиском по разделу: можно искать по имени, телефону, документам, адресу и дополнительным контактам."
        );
    }

    if (normalizeAssistantRoute(currentPath) === "/daily" && /^что\s+на\s+этой\s+странице/.test(prompt)) {
        return getDailyAssistantIntro(assistantName, app);
    }

    return "";
};

const getAuth = () => {
    try {
        return JSON.parse(window.localStorage.getItem("auth") || "null");
    } catch (error) {
        return null;
    }
};

const escapeRegExp = value => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeAssistantRoute = value => {
    const route = String(value || "")
        .replace(/^https?:\/\/[^/]+/i, "")
        .split("#")[0]
        .split("?")[0]
        .replace(/\/+$/, "");

    return route || "/";
};

const isSameRoute = (firstRoute, secondRoute) => (
    normalizeAssistantRoute(firstRoute) === normalizeAssistantRoute(secondRoute)
);

const pageIntroOverrides = {
    "/settings/employees": assistantName => (
        `Здравствуйте, я ${assistantName}. Вижу, что вы открыли раздел «Сотрудники».\n\n` +
        "На этой странице можно управлять сотрудниками организации: искать сотрудников, назначать конкретным сотрудникам должности, менять их статус, добавлять новые должности и регулировать полномочия для каждой должности."
    ),
    "/daily": (assistantName, app) => getDailyAssistantIntro(assistantName, app),
};

const getPageIntroOverride = (currentPath, assistantName, app) => {
    const override = pageIntroOverrides[normalizeAssistantRoute(currentPath)];

    return typeof override === "function" ? override(assistantName, app) : override;
};

const removeAccessAvailabilityNotes = answer => String(answer || "")
    .replace(/(^|[.!?]\s+|\n+)([^.!?\n]*(?:раздел|страница)[^.!?\n]*доступ[^\n.!?]*(?:администратор|пользовател)[^.!?\n]*[.!?]?)/gi, (match, prefix) => (
        prefix.startsWith("\n") ? "\n" : prefix.match(/^[.!?]\s+/) ? prefix.slice(0, 1) + " " : ""
    ));

const removeCurrentPageOpenPrompt = (answer, currentPath) => {
    if (!currentPath) return answer;

    const normalizedPath = normalizeAssistantRoute(currentPath);
    if (normalizedPath === "/") return answer;

    const routePattern = `${escapeRegExp(normalizedPath)}(?:[/?#][^\\s.!?,;:)]*)?`;
    const navigationWords = "если хотите начать|первый шаг|начните|начать|откройте|перейдите|зайдите|открыть|перейти|зайти";
    const currentPagePromptPattern = new RegExp(
        `(^|[.!?]\\s+|\\n+)` +
        `([^.!?\\n]*(?:${navigationWords})[^.!?\\n]*\`?${routePattern}\`?[^.!?\\n]*[.!?]?)`,
        "gi"
    );

    return answer
        .replace(currentPagePromptPattern, (match, prefix) => (
            prefix.startsWith("\n") ? "\n" : prefix.match(/^[.!?]\s+/) ? prefix.slice(0, 1) + " " : ""
        ))
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]{2,}/g, " ")
        .trim();
};

const formatAssistantAnswer = (body, currentPath = "") => {
    const answer = removeAccessAvailabilityNotes(
        removeCurrentPageOpenPrompt(body?.answer || body?.text || "", currentPath)
    ).replace(/\n{3,}/g, "\n\n").trim();
    const links = Array.isArray(body?.links)
        ? body.links.filter(link => link?.to && !isSameRoute(link.to, currentPath))
        : [];

    if (!links.length) return answer;

    return [
        answer,
        "",
        ...links
            .map(link => `${link.label || link.to}: ${link.to}`),
    ].filter(Boolean).join("\n");
};

const pathPattern = /(`?)(\/[a-z0-9_/:?-][a-z0-9_/:?=-]*)(`?)/gi;

const trimPathSuffix = value => {
    const match = String(value || "").match(/^(.+?)([.,;:!?)]*)$/);
    return {
        path: match ? match[1] : value,
        suffix: match ? match[2] : "",
    };
};

const renderMessageLine = (line, keyPrefix) => {
    const parts = [];
    let lastIndex = 0;
    let match;

    pathPattern.lastIndex = 0;

    while ((match = pathPattern.exec(line)) !== null) {
        const [raw, openingTick, rawPath] = match;
        const { path, suffix } = trimPathSuffix(rawPath);

        if (match.index > lastIndex) {
            parts.push(line.slice(lastIndex, match.index));
        }

        parts.push(
            <Link
                className="assistant-chat-route-button"
                to={path}
                key={`${keyPrefix}-link-${match.index}`}
            >
                {`Открыть ${path}`}
            </Link>
        );

        if (suffix) parts.push(suffix);

        lastIndex = match.index + raw.length;

        if (openingTick && raw.endsWith("`")) {
            lastIndex = match.index + raw.length;
        }
    }

    if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex));
    }

    return parts.length ? parts : line;
};

const AssistantChat = ({ isOpen, onOpen, onClose, userName = "", userId = "", app = {} }) => {
    const assistant = getAssistantForUserName(userName);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [quickPrompts, setQuickPrompts] = useState(FALLBACK_QUICK_PROMPTS);
    const [isSending, setIsSending] = useState(false);
    const [onboardingProgress, setOnboardingProgress] = useState(() => getOnboardingProgress(userId));
    const bodyRef = useRef(null);
    const currentPath = window.location.pathname;
    const onboardingStep = onboardingProgress.dismissed
        ? null
        : getCurrentOnboardingStep(onboardingProgress);
    const pageIntroOverride = getPageIntroOverride(currentPath, assistant.name, app);

    useEffect(() => {
        setOnboardingProgress(getOnboardingProgress(userId));
    }, [userId]);

    useEffect(() => {
        const onOnboardingChange = event => {
            if (String(event.detail?.userId || "guest") !== String(userId || "guest")) return;

            setOnboardingProgress(event.detail?.progress || getOnboardingProgress(userId));
        };

        window.addEventListener(ONBOARDING_CHANGE_EVENT, onOnboardingChange);
        return () => window.removeEventListener(ONBOARDING_CHANGE_EVENT, onOnboardingChange);
    }, [userId]);

    useEffect(() => {
        let isMounted = true;

        const loadContext = async () => {
            if (onboardingStep) {
                setMessages([]);
                setQuickPrompts(FALLBACK_QUICK_PROMPTS);
                return;
            }

            const query = new URLSearchParams({
                currentPath,
                userName,
            });
            const res = await rest(`assistant/context?${query.toString()}`, "GET", "", false, {
                updateStore: false,
            });

            if (!isMounted) return;

            const intro = removeAccessAvailabilityNotes(removeCurrentPageOpenPrompt(
                pageIntroOverride || res?.body?.intro || (
                `Здравствуйте, я ${assistant.name}. Я помогу быстрее освоиться в приложении.\n\n` +
                "Спросите, что нужно сделать, или напишите: `что на этой странице?`."
                ),
                currentPath
            )).replace(/\n{3,}/g, "\n\n").trim();

            setMessages([createAssistantMessage(intro)]);
            setQuickPrompts(
                Array.isArray(res?.body?.quickPrompts) && res.body.quickPrompts.length
                    ? res.body.quickPrompts
                    : FALLBACK_QUICK_PROMPTS
            );
        };

        loadContext();

        return () => {
            isMounted = false;
        };
    }, [assistant.name, currentPath, onboardingStep, pageIntroOverride, userName]);

    useEffect(() => {
        if (!bodyRef.current) return;
        if (onboardingStep) {
            bodyRef.current.scrollTop = 0;
            return;
        }
        bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }, [messages, isOpen, onboardingStep]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const onKeyDown = event => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    const send = async value => {
        const content = String(value || message).trim();
        if (!content || isSending) return;

        const currentPath = window.location.pathname;
        const userMessage = createUserMessage(content);
        const localAnswer = getLocalAssistantReply(content, currentPath, app, assistant.name);
        const history = messages
            .filter(item => ["user", "assistant"].includes(item.role))
            .slice(-8)
            .map(item => ({
                role: item.role,
                content: item.content,
            }));

        setMessage("");

        if (localAnswer) {
            setMessages(prev => [
                ...prev,
                userMessage,
                createAssistantMessage(localAnswer),
            ]);
            return;
        }

        setMessages(prev => [...prev, userMessage]);
        setIsSending(true);

        const auth = getAuth();
        const res = await rest("assistant/chat", "POST", {
            message: content,
            currentPath,
            user: auth?.user || {
                name: userName,
            },
            userName,
            role: auth?.user?.role,
            appContext: {
                currentPath,
                availableActions: [],
            },
            history,
        }, false, {
            updateStore: false,
        });

        const answer = res?.ok ? formatAssistantAnswer(res?.body, currentPath) : "";

        setMessages(prev => [
            ...prev,
            createAssistantMessage(answer || getAssistantErrorReply()),
        ]);
        setIsSending(false);
    };

    const submit = event => {
        event.preventDefault();
        send();
    };

    const disableAssistant = () => {
        saveAppSettings({
            ...getAppSettings(),
            assistantEnabled: false,
        });
        onClose();
    };

    const completeCurrentOnboardingStep = () => {
        if (!onboardingStep) return;

        setOnboardingProgress(prev => completeOnboardingStep(prev, onboardingStep.id, userId));
    };

    const hideOnboarding = () => {
        setOnboardingProgress(prev => dismissOnboarding(prev, userId));
    };

    const restartOnboarding = () => {
        setMessages([]);
        setOnboardingProgress(resetOnboardingProgress(userId));
    };

    if (!isOpen) {
        return (
            <div className="assistant-chat-launcher">
                <AssistantBadge userName={userName} onClick={onOpen} />
            </div>
        );
    }

    return (
        <div className="assistant-chat-layer">
            <div className="assistant-chat" role="dialog" aria-label={`Чат с помощником ${assistant.name}`}>
                <div className="assistant-chat-header">
                    <img className="assistant-chat-avatar" src={assistant.avatar} alt={assistant.name} />
                    <div className="assistant-chat-heading">
                        <div className="assistant-chat-name">{assistant.name}</div>
                        <div className="assistant-chat-status">Помощник по приложению</div>
                    </div>
                    <button
                        className="assistant-chat-disable"
                        type="button"
                        onClick={disableAssistant}
                    >
                        Выкл
                    </button>
                    <button
                        className="assistant-chat-training"
                        type="button"
                        onClick={restartOnboarding}
                    >
                        Обучение
                    </button>
                    <IconButton
                        className="assistant-chat-close"
                        onClick={onClose}
                        aria-label="Закрыть чат"
                        size="small"
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </div>

                <div className="assistant-chat-body" ref={bodyRef}>
                    {onboardingStep && <div className="assistant-onboarding-card">
                        <div className="assistant-onboarding-kicker">
                            {firstSetupScenario.title}
                        </div>
                        <div className="assistant-onboarding-title">
                            {onboardingStep.title}
                        </div>
                        <div className="assistant-onboarding-text">
                            {onboardingStep.intro}
                        </div>
                        <ol className="assistant-onboarding-list">
                            {onboardingStep.checklist.map(item => (
                                <li key={item.text || item}>
                                    <span>{item.text || item}</span>
                                    {item.to && <Link className="assistant-onboarding-inline-link" to={item.to}>
                                        {item.label || item.to}
                                    </Link>}
                                    {item.action && <span
                                        className="assistant-onboarding-action-chip"
                                        title={item.actionLabel || item.action}
                                        aria-label={item.actionLabel || item.action}
                                    >
                                        {item.action}
                                    </span>}
                                </li>
                            ))}
                        </ol>
                        {onboardingStep.note && <div className="assistant-onboarding-note">
                            {onboardingStep.note}
                        </div>}
                        <div className="assistant-onboarding-actions">
                            <Link className="assistant-onboarding-link" to={onboardingStep.path}>
                                Открыть страницу
                            </Link>
                            <button
                                className="assistant-onboarding-button"
                                type="button"
                                onClick={completeCurrentOnboardingStep}
                            >
                                Готово, дальше
                            </button>
                            <button
                                className="assistant-onboarding-ghost"
                                type="button"
                                onClick={hideOnboarding}
                            >
                                Скрыть
                            </button>
                        </div>
                    </div>}
                    {messages.map((item, index) => {
                        const lines = item.content.split("\n");

                        return (
                            <div
                                className={`assistant-chat-message-row assistant-chat-message-row-${item.role}`}
                                key={`${item.role}-${item.createdAt}-${index}`}
                            >
                                <div className={`assistant-chat-message assistant-chat-message-${item.role}`}>
                                    {lines.map((line, lineIndex) => (
                                        <React.Fragment key={`${index}-${lineIndex}`}>
                                            {renderMessageLine(line, `${index}-${lineIndex}`)}
                                            {lineIndex < lines.length - 1 && <br />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="assistant-chat-prompts">
                    {quickPrompts.map(prompt => (
                        <button
                            className="assistant-chat-prompt"
                            type="button"
                            key={prompt}
                            onClick={() => send(prompt)}
                        >
                            {prompt}
                        </button>
                    ))}
                </div>

                <form className="assistant-chat-form" onSubmit={submit}>
                    <input
                        className="assistant-chat-input"
                        value={message}
                        onChange={event => setMessage(event.target.value)}
                        placeholder="Напишите вопрос..."
                        autoFocus
                    />
                    <IconButton
                        className="assistant-chat-send"
                        type="submit"
                        aria-label="Отправить"
                        size="small"
                        disabled={!message.trim() || isSending}
                    >
                        <SendIcon fontSize="small" />
                    </IconButton>
                </form>
            </div>
        </div>
    );
};

export default AssistantChat;
