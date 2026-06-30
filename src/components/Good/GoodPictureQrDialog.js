import React from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { QRCodeSVG } from "qrcode.react";

const statusLabels = {
    waiting: "Ожидаем фото",
    uploaded: "Фото загружено",
    saved: "Фото загружено",
    done: "Фото загружено",
    error: "Ошибка",
    expired: "Ссылка истекла",
};

const progressStatuses = new Set(["waiting", "uploading"]);

export default function GoodPictureQrDialog({
    open,
    session,
    status = "waiting",
    error = "",
    onCancel,
    onComputerUpload,
}) {
    const captureUrl = session?.capture_url || "";
    const statusText = error || statusLabels[status] || statusLabels.waiting;

    return <Dialog open={open} onClose={onCancel} className="good-picture-qr-dialog">
        <DialogTitle>Фото товара с телефона</DialogTitle>
        <DialogContent className="good-picture-qr-dialog-content">
            {progressStatuses.has(status) && <LinearProgress className="good-picture-qr-progress" />}

            <div className="good-picture-qr-code-wrap">
                {captureUrl
                    ? <QRCodeSVG value={captureUrl} size={220} />
                    : <div className="good-picture-qr-placeholder" />}
            </div>

            <Typography className="good-picture-qr-status">{statusText}</Typography>

            {captureUrl && <Typography className="good-picture-qr-link">
                {captureUrl}
            </Typography>}
        </DialogContent>
        <DialogActions>
            <Button onClick={onComputerUpload}>
                Загрузить с компьютера
            </Button>
            <Button onClick={onCancel} color="secondary">
                Отменить
            </Button>
        </DialogActions>
    </Dialog>;
}
