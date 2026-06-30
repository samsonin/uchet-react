import React, { useEffect, useMemo, useState } from "react";

import CampaignIcon from "@mui/icons-material/Campaign";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import { UiDropdown } from "../common/Ui";
import {
    getSeenUpdateIds,
    getUnreadUpdates,
    markAllUpdatesSeen,
    markUpdateSeen,
    productUpdates,
} from "./updates";

const UpdatesMenu = ({ userId }) => {
    const [seenIds, setSeenIds] = useState(() => getSeenUpdateIds(userId));

    useEffect(() => {
        setSeenIds(getSeenUpdateIds(userId));
    }, [userId]);

    const unreadUpdates = useMemo(() => getUnreadUpdates(userId), [userId, seenIds]);
    const unreadCount = unreadUpdates.length;

    const markSeen = updateId => {
        setSeenIds(markUpdateSeen(updateId, userId));
    };

    const markAllSeen = () => {
        setSeenIds(markAllUpdatesSeen(userId));
    };

    return <>
        <UiDropdown
            align="right"
            className="updates-menu"
            buttonClassName={`updates-menu-button ${unreadCount ? "has-unread" : ""}`}
            label={<span className="updates-menu-label">
                <CampaignIcon fontSize="small" />
                <span className="updates-menu-label-text">Что нового</span>
                {unreadCount > 0 && <span className="updates-menu-badge">{unreadCount}</span>}
            </span>}
        >
            {close => <div className="updates-panel">
                <div className="updates-panel-header">
                    <div>
                        <div className="updates-panel-title">Что нового</div>
                        <div className="updates-panel-subtitle">Коротко о функциях, которые уже можно попробовать.</div>
                    </div>
                    {unreadCount > 0 && <button
                        type="button"
                        className="updates-mark-all"
                        onClick={markAllSeen}
                    >
                        <DoneAllIcon fontSize="small" />
                        Все прочитано
                    </button>}
                </div>

                <div className="updates-list">
                    {productUpdates.map(update => {
                        const isUnread = !seenIds.includes(update.id);

                        return <div
                            className={`updates-item ${isUnread ? "is-unread" : ""}`}
                            key={update.id}
                        >
                            <div className="updates-item-accent">{update.accent}</div>
                            <div className="updates-item-body">
                                <div className="updates-item-meta">
                                    <span>{update.date}</span>
                                    {isUnread && <span className="updates-item-new">Новое</span>}
                                </div>
                                <div className="updates-item-title">{update.title}</div>
                                <div className="updates-item-text">{update.description}</div>
                                <div className="updates-item-actions">
                                    {update.video?.src && <a
                                        href={update.video.src}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="updates-action-secondary"
                                        onClick={() => {
                                            markSeen(update.id);
                                            close();
                                        }}
                                    >
                                        <PlayArrowIcon fontSize="small" />
                                        Видео
                                    </a>}
                                </div>
                            </div>
                        </div>;
                    })}
                </div>
            </div>}
        </UiDropdown>
    </>;
};

export default UpdatesMenu;
