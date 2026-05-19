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
    recognizing: "Распознаем",
    recognized: "Готово",
    error: "Ошибка",
    expired: "Ссылка истекла",
};

const progressStatuses = new Set(["waiting", "uploaded", "recognizing"]);

export default function PassportQrDialog({
    open,
    session,
    status = "waiting",
    error = "",
    onCancel,
    onComputerUpload,
}) {
    const captureUrl = session?.capture_url || "";
    const statusText = error || statusLabels[status] || statusLabels.waiting;

    return <Dialog open={open} onClose={onCancel} className="passport-qr-dialog">
        <DialogTitle>Фото паспорта с телефона</DialogTitle>
        <DialogContent className="passport-qr-dialog-content">
            {progressStatuses.has(status) && <LinearProgress className="passport-qr-progress" />}

            <div className="passport-qr-code-wrap">
                {captureUrl
                    ? <QRCodeSVG value={captureUrl} size={220} />
                    : <div className="passport-qr-placeholder" />}
            </div>

            <Typography className="passport-qr-status">{statusText}</Typography>

            {captureUrl && <Typography className="passport-qr-link">
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
