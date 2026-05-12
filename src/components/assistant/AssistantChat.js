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
    const answer = removeCurrentPageOpenPrompt(body?.answer || body?.text || "", currentPath);
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
                className="assistant-chat-link"
                to={path}
                key={`${keyPrefix}-link-${match.index}`}
            >
                {path}
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

const AssistantChat = ({ isOpen, onOpen, onClose, userName = "", userId = "" }) => {
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

            const intro = removeCurrentPageOpenPrompt(res?.body?.intro || (
                `Здравствуйте, я ${assistant.name}. Я помогу быстрее освоиться в приложении.\n\n` +
                "Спросите, что нужно сделать, или напишите: `что на этой странице?`."
            ), currentPath);

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
    }, [assistant.name, currentPath, onboardingStep, userName]);

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
        const history = messages
            .filter(item => ["user", "assistant"].includes(item.role))
            .slice(-8)
            .map(item => ({
                role: item.role,
                content: item.content,
            }));

        setMessages(prev => [...prev, userMessage]);
        setMessage("");
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
