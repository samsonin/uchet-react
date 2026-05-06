import React from "react";

import { getAssistantForUserName } from "./assistants";

const AssistantBadge = ({ userName = "", onClick }) => {
    const assistant = getAssistantForUserName(userName);

    return (
        <button
            className="assistant-badge"
            type="button"
            title={`${assistant.title}: ${assistant.name}`}
            onClick={onClick}
            aria-label={`Открыть чат с помощником ${assistant.name}`}
        >
            <img
                className="assistant-badge-avatar"
                src={assistant.avatar}
                alt={assistant.name}
            />
            <span className="assistant-badge-text">
                <span className="assistant-badge-name">{assistant.name}</span>
                <span className="assistant-badge-title">{assistant.title}</span>
            </span>
        </button>
    );
};

export default AssistantBadge;
