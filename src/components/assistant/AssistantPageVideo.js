import React, { useEffect, useMemo, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import IconButton from "@mui/material/IconButton";

const SCENE_MS = 5200;

const AssistantPageVideo = ({ story, onClose }) => {
    const [sceneIndex, setSceneIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const scenes = story?.scenes || [];
    const scene = scenes[sceneIndex] || scenes[0];
    const progress = useMemo(() => {
        if (!scenes.length) return 0;
        return ((sceneIndex + 1) / scenes.length) * 100;
    }, [sceneIndex, scenes.length]);

    useEffect(() => {
        if (!isPlaying || !scenes.length) return undefined;

        const timer = window.setTimeout(() => {
            setSceneIndex(current => {
                if (current >= scenes.length - 1) {
                    setIsPlaying(false);
                    return current;
                }

                return current + 1;
            });
        }, SCENE_MS);

        return () => window.clearTimeout(timer);
    }, [isPlaying, sceneIndex, scenes.length]);

    useEffect(() => {
        const onKeyDown = event => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    if (!story || !scene) return null;

    const replay = () => {
        setSceneIndex(0);
        setIsPlaying(true);
    };

    return (
        <div className="assistant-video-backdrop" role="dialog" aria-modal="true" aria-label={`Видео: ${story.title}`}>
            <div className="assistant-video">
                <div className="assistant-video-topbar">
                    <div>
                        <div className="assistant-video-kicker">Короткое видео</div>
                        <div className="assistant-video-title">{story.title}</div>
                    </div>
                    <IconButton
                        className="assistant-video-close"
                        onClick={onClose}
                        aria-label="Закрыть видео"
                        size="small"
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </div>

                <div className="assistant-video-stage">
                    <div className="assistant-video-frame" key={sceneIndex}>
                        <div className="assistant-video-accent">{scene.accent}</div>
                        <div className="assistant-video-scene-title">{scene.title}</div>
                        <div className="assistant-video-caption">{scene.caption}</div>
                    </div>
                    <div className="assistant-video-timeline">
                        <span style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div className="assistant-video-controls">
                    <button
                        type="button"
                        className="assistant-video-control"
                        onClick={() => setIsPlaying(value => !value)}
                    >
                        {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                        {isPlaying ? "Пауза" : "Продолжить"}
                    </button>
                    <button
                        type="button"
                        className="assistant-video-control"
                        onClick={replay}
                    >
                        <ReplayIcon fontSize="small" />
                        Сначала
                    </button>
                    <div className="assistant-video-count">
                        {sceneIndex + 1} / {scenes.length}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssistantPageVideo;
