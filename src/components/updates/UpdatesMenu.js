import React, { useEffect, useMemo, useState } from "react";

import CampaignIcon from "@mui/icons-material/Campaign";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";

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
    const [activeVideo, setActiveVideo] = useState(null);
    const [isVideoUnavailable, setVideoUnavailable] = useState(false);

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

    const openVideo = (update, close) => {
        setSeenIds(markUpdateSeen(update.id, userId));
        setVideoUnavailable(false);
        setActiveVideo(update.video);
        close();
    };

    const closeVideo = () => {
        setActiveVideo(null);
        setVideoUnavailable(false);
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
                                    {update.video?.src && <button
                                        type="button"
                                        className="updates-action-secondary"
                                        onClick={() => openVideo(update, close)}
                                    >
                                        <PlayArrowIcon fontSize="small" />
                                        Видео
                                    </button>}
                                </div>
                            </div>
                        </div>;
                    })}
                </div>
            </div>}
        </UiDropdown>
        <Dialog open={Boolean(activeVideo)} onClose={closeVideo} maxWidth="md" fullWidth>
            <DialogTitle>{activeVideo?.title || "Видео"}</DialogTitle>
            <DialogContent>
                {isVideoUnavailable ? <Typography>
                    Видео временно недоступно. Попробуйте открыть его позже.
                </Typography> : activeVideo && <video
                    autoPlay
                    controls
                    poster={activeVideo.poster}
                    style={{display: "block", width: "100%", maxHeight: "70vh"}}
                    onError={() => setVideoUnavailable(true)}
                >
                    <source src={activeVideo.src} type="video/mp4" />
                    Ваш браузер не поддерживает воспроизведение видео.
                </video>}
            </DialogContent>
        </Dialog>
    </>;
};

export default UpdatesMenu;
