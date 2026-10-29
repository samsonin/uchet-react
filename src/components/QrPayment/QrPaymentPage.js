import React, { useCallback, useEffect, useRef, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";

import rest from "../Rest";
import {
    QR_PAYMENT_POLL_MS,
    QR_PAYMENT_SESSION_PATH,
    formatAmount,
    formatCountdown,
    isFinalStatus,
    isMobileUserAgent,
    pageStateFromResponse,
    safePaymentLink,
    secondsLeft,
    tokenFromHash,
} from "./qrPayment";

const requestOptions = {
    auth: false,
    updateStore: false,
    showGlobalLoader: false,
    responseType: "auto",
};

const Message = ({ icon, title, children }) => <div className="qr-payment-message">
    {icon}
    <Typography variant="h6" component="h2">{title}</Typography>
    <Typography className="qr-payment-muted">{children}</Typography>
</div>;

export default function QrPaymentPage() {
    const [token] = useState(() => tokenFromHash(window.location.hash));
    const [state, setState] = useState(() => token ? { kind: "loading" } : { kind: "not-found" });
    const [now, setNow] = useState(Date.now());
    const [qrImage, setQrImage] = useState(null);
    const timer = useRef(null);
    const finished = useRef(false);
    const qrCanvasBox = useRef(null);
    const mobile = isMobileUserAgent(window.navigator.userAgent);

    const load = useCallback(async () => {
        clearTimeout(timer.current);
        const response = await rest(QR_PAYMENT_SESSION_PATH, "POST", { token }, false, requestOptions);
        const next = pageStateFromResponse(response);
        // A lost poll keeps the QR on screen; only the first load shows the network error.
        setState(current => next.kind === "network" && current.kind === "order" ? current : next);
        const status = next.kind === "order" ? next.order.status : null;
        finished.current = !!status && isFinalStatus(status);
        if (next.kind === "network" || (status && !isFinalStatus(status))) {
            timer.current = setTimeout(load, QR_PAYMENT_POLL_MS);
        }
    }, [token]);

    useEffect(() => {
        document.title = "Оплата через СБП";
        if (token) load();
        return () => clearTimeout(timer.current);
    }, [token, load]);

    useEffect(() => {
        const tick = setInterval(() => setNow(Date.now()), 1000);
        // Another order's link opened in this tab changes only the fragment.
        const reload = () => window.location.reload();
        // Back from the bank app the browser has paused the polling: check at once.
        const recheck = () => {
            if (token && !finished.current && document.visibilityState === "visible") load();
        };
        window.addEventListener("hashchange", reload);
        document.addEventListener("visibilitychange", recheck);
        window.addEventListener("pageshow", recheck);
        return () => {
            clearInterval(tick);
            window.removeEventListener("hashchange", reload);
            document.removeEventListener("visibilitychange", recheck);
            window.removeEventListener("pageshow", recheck);
        };
    }, [token, load]);

    const order = state.kind === "order" ? state.order : null;
    const link = order?.status === "pending" ? safePaymentLink(order.qrPayload) : null;
    const left = order ? secondsLeft(order.expiresAt, now) : 0;

    // The QR is shown as a PNG picture, so a phone can keep it and a bank app can read it from the gallery.
    useEffect(() => {
        let image = null;
        try {
            const canvas = link && qrCanvasBox.current?.querySelector("canvas");
            const url = canvas ? canvas.toDataURL("image/png") : null;
            image = typeof url === "string" && url.startsWith("data:image/png") ? url : null;
        } catch (e) {
            image = null;
        }
        setQrImage(image);
    }, [link]);

    let body;
    if (state.kind === "loading") {
        body = <div className="qr-payment-message"><CircularProgress /></div>;
    } else if (state.kind === "not-found") {
        body = <Message icon={<ErrorOutlineIcon className="qr-payment-icon qr-payment-icon--error" />}
                        title="Ссылка недействительна">
            Вернитесь на страницу, где начинали оплату, и создайте новый заказ.
        </Message>;
    } else if (state.kind === "unavailable" || state.kind === "network") {
        body = <Message icon={<ErrorOutlineIcon className="qr-payment-icon qr-payment-icon--error" />}
                        title="Сервис оплаты временно недоступен">
            Попробуйте ещё раз через минуту.
            <Button className="qr-payment-retry" variant="outlined" onClick={() => {
                setState({ kind: "loading" });
                load();
            }}>Повторить</Button>
        </Message>;
    } else if (order.status === "paid") {
        body = <Message icon={<CheckCircleOutlineIcon className="qr-payment-icon qr-payment-icon--ok" />}
                        title="Оплата получена">
            Заказ №{order.orderNo} оплачен. Можно закрыть эту страницу и вернуться в приложение.
        </Message>;
    } else if (order.status === "review") {
        body = <Message icon={<CheckCircleOutlineIcon className="qr-payment-icon" />} title="Оплата проверяется">
            Платёж по заказу №{order.orderNo} получен и проверяется. Если в течение часа ничего не изменится,
            напишите в поддержку и укажите номер заказа.
        </Message>;
    } else if (order.status === "failed") {
        body = <Message icon={<ErrorOutlineIcon className="qr-payment-icon qr-payment-icon--error" />}
                        title="Платёж не прошёл">
            Деньги не списаны. Вернитесь на страницу, где начинали оплату, и создайте новый заказ.
        </Message>;
    } else if (order.status === "expired" || !link || left === 0) {
        body = <Message icon={<ErrorOutlineIcon className="qr-payment-icon qr-payment-icon--error" />}
                        title="Время на оплату истекло">
            Если вы ещё не платили, вернитесь на страницу, где начинали оплату, и создайте новый заказ.
        </Message>;
    } else {
        body = <>
            <div className="qr-payment-code">
                {qrImage
                    ? <img className="qr-payment-image" src={qrImage} alt="QR-код для оплаты по СБП" />
                    : <QRCodeSVG value={link} size={232} bgColor="#ffffff" fgColor="#000000" marginSize={2} />}
            </div>
            <div ref={qrCanvasBox} hidden>
                <QRCodeCanvas value={link} size={480} bgColor="#ffffff" fgColor="#000000" marginSize={4} />
            </div>
            <Typography className="qr-payment-muted">
                {mobile
                    ? "Откройте приложение банка кнопкой ниже или сохраните QR-код и выберите его в приложении банка при оплате по QR-коду."
                    : "Отсканируйте QR-код камерой телефона или в приложении банка и подтвердите оплату."}
            </Typography>
            {/* A new tab keeps this page, which notices the payment as soon as the buyer comes back. */}
            {mobile && <Button variant="contained" size="large" href={link} target="_blank" rel="noopener noreferrer">
                Открыть приложение банка
            </Button>}
            {mobile && qrImage && <Button variant="outlined" size="large" href={qrImage}
                                          download={`qr-oplata-${order.orderNo}.png`}>
                Сохранить QR-код
            </Button>}
            <Typography className="qr-payment-muted qr-payment-small">
                Код действует ещё {formatCountdown(left)}. Страница обновится сама после оплаты.
            </Typography>
        </>;
    }

    return <main className="qr-payment-page">
        <section className="qr-payment-panel">
            <Typography variant="h5" component="h1">Оплата через СБП</Typography>
            {order && <div className="qr-payment-summary">
                <span className="qr-payment-amount">{formatAmount(order.amount, order.currency)}</span>
                <span className="qr-payment-muted">Заказ №{order.orderNo}</span>
            </div>}
            {order?.test && <div className="qr-payment-test">Тестовый режим: деньги не списываются</div>}
            {body}
        </section>
    </main>;
}
