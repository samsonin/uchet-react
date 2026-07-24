import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {QRCodeCanvas} from "qrcode.react";
import {
    Button,
    FormControl,
    Grid,
    InputLabel,
    Link,
    MenuItem,
    Paper,
    Select,
    Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import LinkIcon from "@mui/icons-material/Link";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {useSnackbar} from "notistack";

import rest from "./Rest";
import StocksSelect from "./common/StocksSelect";
import {
    buildMobileDevicePairingPayload,
    getMobileDeviceQrPayload,
    isSuccessfulPairingCodeResponse,
    resolveMobileDeviceStockId,
    shouldSelectMobileDeviceStock,
} from "./mobileDevicePairing";

const APK_URL = "https://f005.backblazeb2.com/file/uchet-store/mobile/uchet-sms-phone-latest.apk";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=store.uchet.app";
const PRIVACY_URL = "https://uchet.store/privacy";

const formatExpiresAt = value => {
    if (!value) return "";

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const formatLastSeen = value => {
    if (!value) return "нет связи";

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const IntegrationSmsPhone = props => {
    const validStocks = (props.app.stocks || []).filter(stock => stock.is_valid !== false);
    const globalStockId = Number(props.app.current_stock_id || 0);
    const [manualStockId, setManualStockId] = useState(0);
    const stockId = globalStockId || manualStockId || resolveMobileDeviceStockId(0, validStocks);
    const shouldSelectStock = shouldSelectMobileDeviceStock(globalStockId, validStocks);
    const [pairingCode, setPairingCode] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [devices, setDevices] = useState(props.app.sms_phones || []);
    const {enqueueSnackbar} = useSnackbar();
    const qrPayload = getMobileDeviceQrPayload(pairingCode);

    const refreshDevices = () => rest("mobile-devices", "GET", undefined, false, {
        updateStore: false,
    }).then(res => {
        if (res.status === 200) setDevices(res.body?.mobile_devices || []);
    });

    useEffect(() => {
        refreshDevices();
    }, []);

    const disconnectDevice = device => {
        if (!window.confirm("Отключить этот SMS-телефон?")) return;

        rest("mobile-devices/" + device.id, "DELETE", undefined, false, {
            updateStore: false,
        }).then(res => {
            if (res.status === 204) {
                refreshDevices();
                return;
            }
            enqueueSnackbar(res.body?.error || "Не удалось отключить SMS-телефон", {variant: "error"});
        });
    };

    const createPairingCode = () => {
        setLoading(true);

        rest("mobile-devices/pairing-codes", "POST", buildMobileDevicePairingPayload(stockId), false, {
            updateStore: false,
        }).then(res => {
            setLoading(false);

            if (isSuccessfulPairingCodeResponse(res)) {
                setPairingCode(res.body);
                setTimeout(refreshDevices, 1000);
                return;
            }

            enqueueSnackbar(res.body?.message || res.body?.error || "Не удалось создать код подключения", {
                variant: "error",
            });
        });
    };

    return <Grid container spacing={2} className="w-100">
        <Grid item xs={12}>
            <Typography variant="h4">SMS-телефон</Typography>
            <Typography variant="body1" style={{marginTop: "0.5rem"}}>
                Подключите Android-телефон, чтобы отправлять клиентам SMS из Учет.
            </Typography>
        </Grid>

        <Grid item xs={12} md={5}>
            <Paper style={{padding: "1.25rem", height: "100%", boxSizing: "border-box"}}>
                <Typography variant="h5">1. Подготовьте телефон</Typography>
                <Typography variant="body2" style={{marginTop: "0.5rem"}}>
                    Нужен Android 7.0 или новее, SIM-карта и доступ к интернету. Установите Учет и разрешите ему отправлять SMS.
                </Typography>
                <Grid container spacing={1} style={{marginTop: "0.75rem"}}>
                    <Grid item>
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon/>}
                            href={APK_URL}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Скачать APK
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="outlined"
                            startIcon={<OpenInNewIcon/>}
                            href={GOOGLE_PLAY_URL}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Google Play
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
            <Paper style={{padding: "1.25rem", height: "100%", boxSizing: "border-box"}}>
                <Typography variant="h5">2. Создайте QR-код для точки</Typography>
                <Typography variant="body2" style={{marginTop: "0.5rem"}}>
                    Выберите точку, с которой телефон будет отправлять SMS, затем создайте одноразовый код подключения.
                </Typography>

                {shouldSelectStock && <div style={{marginTop: "1rem", maxWidth: "420px"}}>
                    {validStocks.length > 1
                        ? <StocksSelect
                            stocks={validStocks}
                            stock={manualStockId}
                            setStock={setManualStockId}
                            classes="w-100"
                        />
                        : <FormControl className="w-100">
                            <InputLabel id="sms-phone-stock-label">Точка</InputLabel>
                            <Select
                                labelId="sms-phone-stock-label"
                                value={stockId || ""}
                                label="Точка"
                                onChange={e => setManualStockId(e.target.value)}
                            >
                                {validStocks.map(stock => <MenuItem
                                    key={"sms-phone-stock-" + stock.id}
                                    value={stock.id}
                                >
                                    {stock.name}
                                </MenuItem>)}
                            </Select>
                        </FormControl>}
                </div>}

                <Button
                    variant="contained"
                    color="primary"
                    disabled={isLoading || !stockId}
                    onClick={createPairingCode}
                    startIcon={pairingCode ? <RefreshIcon/> : <LinkIcon/>}
                    style={{marginTop: "1rem"}}
                >
                    {pairingCode ? "Обновить QR-код" : "Создать QR-код"}
                </Button>
            </Paper>
        </Grid>

        {qrPayload && <Grid item xs={12}>
            <Paper style={{padding: "1.25rem"}}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm="auto">
                        <QRCodeCanvas value={qrPayload} size={256} includeMargin/>
                    </Grid>
                    <Grid item xs={12} sm>
                        <Typography variant="h5">3. Откройте QR-код телефоном</Typography>
                        <Typography variant="body1" style={{marginTop: "0.5rem"}}>
                            Отсканируйте код обычной камерой Android-телефона. Если Учет уже установлен, телефон подключится автоматически.
                        </Typography>
                        <Typography variant="body2" style={{marginTop: "0.5rem"}}>
                            Если приложения нет, откроется установка в Google Play. После установки откройте «Учет» — одноразовый код применится автоматически. Для APK вернитесь на страницу и нажмите «Открыть Учет».
                        </Typography>
                        <Typography variant="body2" style={{marginTop: "1rem"}}>
                            Код для ручного ввода: <strong>{pairingCode.code}</strong>
                        </Typography>
                        {pairingCode.expires_at && <Typography variant="body2">
                            Действует до: {formatExpiresAt(pairingCode.expires_at)}
                        </Typography>}
                    </Grid>
                </Grid>
            </Paper>
        </Grid>}

        <Grid item xs={12}>
            <Typography variant="h5">Подключенные телефоны</Typography>
            <Typography variant="body2" style={{marginTop: "0.25rem"}}>
                Здесь отображаются телефоны, которые могут отправлять SMS из Учет.
            </Typography>
            {devices.length === 0 && <Paper style={{padding: "1rem", marginTop: "0.75rem"}}>
                <Typography variant="body2">Пока нет подключенных телефонов. Выполните шаги 1–3 выше.</Typography>
            </Paper>}
            {devices.map(device => <Paper key={"sms-device-" + device.id} style={{padding: "1rem", marginTop: "0.75rem"}}>
                <Grid container spacing={1} alignItems="center">
                    <Grid item xs>
                        <Typography>{device.device_name || "Android-телефон"}</Typography>
                        <Typography variant="body2">
                            Точка: {validStocks.find(stock => +stock.id === +device.stock_id)?.name || "Все точки"}.
                            {" "}Статус: {device.is_active ? "подключен" : "отключен"}.
                            {" "}Последняя связь: {formatLastSeen(device.last_seen_at)}.
                        </Typography>
                    </Grid>
                    {device.is_active && <Grid item>
                        <Button color="secondary" onClick={() => disconnectDevice(device)}>
                            Отключить
                        </Button>
                    </Grid>}
                </Grid>
            </Paper>)}
        </Grid>

        <Grid item xs={12}>
            <Typography variant="body2">
                Перед установкой ознакомьтесь с <Link href={PRIVACY_URL} target="_blank" rel="noreferrer">политикой конфиденциальности</Link>.
            </Typography>
        </Grid>
    </Grid>;
};

export default connect(state => state)(IntegrationSmsPhone);
