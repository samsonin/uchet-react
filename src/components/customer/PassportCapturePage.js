import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import { PASSPORT_OCR_SESSION_PATH } from "../../constants";
import rest from "../Rest";

export default function PassportCapturePage() {
    const { token } = useParams();
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");

    const uploadPath = useMemo(() => (
        `${PASSPORT_OCR_SESSION_PATH}/${encodeURIComponent(token || "")}/image`
    ), [token]);

    const handlePhoto = async event => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        setStatus("uploading");
        setError("");

        const formData = new FormData();
        formData.append("image", file);

        const res = await rest(uploadPath, "POST", formData, false, {
            auth: false,
            bodyType: "formData",
            updateStore: false,
            responseType: "auto",
        });

        if (!res.ok) {
            setStatus("error");
            setError(res.body?.message || "Не удалось загрузить фото. Проверьте ссылку или попробуйте еще раз.");
            return;
        }

        setStatus("done");
    };

    return <main className="passport-capture-page">
        <section className="passport-capture-panel">
            <Typography variant="h5" component="h1">
                Фото паспорта
            </Typography>

            {status === "done"
                ? <Typography className="passport-capture-message">
                    Фото принято. Можно вернуться к компьютеру.
                </Typography>
                : <>
                    <Typography className="passport-capture-message">
                        Сделайте фото паспорта или выберите готовое изображение.
                    </Typography>
                    <Button
                        component="label"
                        variant="contained"
                        startIcon={status === "uploading" ? <CircularProgress size={18} /> : <CameraAltOutlinedIcon />}
                        disabled={status === "uploading" || !token}
                    >
                        {status === "uploading" ? "Загружаем..." : "Сделать фото"}
                        <input
                            hidden
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhoto}
                        />
                    </Button>
                </>}

            {error && <Typography className="passport-capture-error">
                {error}
            </Typography>}
        </section>
    </main>;
}
