import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {QRCodeCanvas} from "qrcode.react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {useSnackbar} from "notistack";

import rest from "./Rest";
import StocksSelect from "./common/StocksSelect";
import {
    buildMobileDevicePairingPayload,
    getMobileDeviceQrPayload,
    isSuccessfulPairingCodeResponse,
    applyMobileDeviceAction,
    resolveMobileDeviceStockId,
    shouldSelectMobileDeviceStock,
} from "./mobileDevicePairing";
import {groupSmsGatewayAuditEvents} from "./smsGatewayAudit";

export const GATEWAY_APK_URL = "https://f005.backblazeb2.com/file/uchet-store/mobile/uchet-sms-gateway-latest.apk";
const PRIVACY_URL = "https://api.uchet.store/legal/sms-gateway/privacy";
const TERMS_URL = "https://api.uchet.store/legal/sms-gateway/terms";

export const GatewayDownloadQr = () => <QRCodeCanvas
    value={GATEWAY_APK_URL}
    size={160}
    includeMargin
/>;

export const GatewayDownloadActions = () => <div style={{display: "flex", alignItems: "flex-start", flexWrap: "nowrap", gap: "1rem", marginTop: "0.75rem"}}>
    <div style={{flex: "1 1 0", minWidth: 0}}>
        <Typography variant="h5">1. Установите SMS Gateway</Typography>
        <Typography variant="body2" style={{marginTop: "0.5rem"}}>
            Нужен Android 8.0 или новее, SIM-карта и доступ к интернету. Установите служебное приложение Uchet SMS Gateway и разрешите ему отправлять SMS.
        </Typography>
        <Button
            variant="contained"
            startIcon={<DownloadIcon/>}
            href={GATEWAY_APK_URL}
            target="_blank"
            rel="noreferrer"
        >
            Скачать Uchet SMS Gateway
        </Button>
    </div>
    <div style={{flex: "0 0 auto"}}>
        <GatewayDownloadQr/>
    </div>
</div>;

const auditEventLabels = {
    pairing_code_created: "Создан код подключения",
    device_disconnected: "Телефон отключен",
    device_deleted: "Телефон удален",
    command_created: "Подготовлена SMS-команда",
    sent_to_fcm: "Команда отправлена на телефон",
    fcm_failed: "Команда не доставлена на телефон",
    rate_limited: "SMS заблокирована лимитом",
    dispatch_blocked: "SMS не отправлена",
    result_sent: "SMS принята оператором",
    result_delivered: "SMS доставлена",
    result_delivery_failed: "Нет подтверждения доставки",
    result_failed: "Не удалось отправить SMS",
};

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
    const [deviceActionId, setDeviceActionId] = useState(null);
    const [pendingDeviceAction, setPendingDeviceAction] = useState(null);
    const [devices, setDevices] = useState(props.app.sms_phones || []);
    const [auditEvents, setAuditEvents] = useState([]);
    const {enqueueSnackbar} = useSnackbar();
    const qrPayload = getMobileDeviceQrPayload(pairingCode);
    const auditGroups = groupSmsGatewayAuditEvents(auditEvents);

    const refreshDevices = () => rest("mobile-devices", "GET", undefined, false, {
        updateStore: false,
    }).then(res => {
        if (res.status === 200) setDevices(res.body?.mobile_devices || []);
    });

    const refreshAuditEvents = () => rest("sms-gateway/audit-events?limit=30", "GET", undefined, false, {
        updateStore: false,
    }).then(res => {
        if (res.status === 200) setAuditEvents(res.body?.audit_events || []);
    });

    useEffect(() => {
        refreshDevices();
        refreshAuditEvents();
    }, []);

    const changeDeviceState = async device => {
        const isActive = Boolean(device.is_active);
        const action = isActive ? "Отключить" : "Удалить";

        setDeviceActionId(device.id);
        let res;

        try {
            res = await rest("mobile-devices/" + device.id, "DELETE", undefined, false, {
                updateStore: false,
            });
        } finally {
            setDeviceActionId(null);
        }

        if (res.status === 204) {
            setDevices(current => applyMobileDeviceAction(current, device));
            setPendingDeviceAction(null);
            enqueueSnackbar(isActive ? "Телефон отключен" : "Телефон удален", {variant: "success"});
            refreshDevices();
            refreshAuditEvents();
            return;
        }

        enqueueSnackbar(res.body?.error || `Не удалось ${action.toLowerCase()} SMS-телефон`, {variant: "error"});
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
                refreshAuditEvents();
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
                Подключите выделенный Android-телефон, чтобы отправлять клиентам SMS из Учет.
            </Typography>
        </Grid>

        <Grid item xs={12} md={5}>
            <Paper style={{padding: "1.25rem", height: "100%", boxSizing: "border-box"}}>


                <GatewayDownloadActions/>
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
                        <Typography variant="h5">3. Откройте QR-код в SMS Gateway</Typography>
                        <Typography variant="body1" style={{marginTop: "0.5rem"}}>
                            В Uchet SMS Gateway отсканируйте код камерой или вставьте код подключения вручную. Телефон подключится к выбранной точке.
                        </Typography>
                        <Typography variant="body2" style={{marginTop: "0.5rem"}}>
                            Если приложение ещё не установлено, сначала скачайте Uchet SMS Gateway по ссылке выше. Это отдельное служебное приложение, не основное CRM Учет.
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
                    <Grid item>
                        <Button
                            variant="outlined"
                            color={device.is_active ? "warning" : "error"}
                            disabled={String(deviceActionId) === String(device.id)}
                            onClick={() => setPendingDeviceAction(device)}
                        >
                            {device.is_active ? "Отключить" : "Удалить"}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>)}
        </Grid>

        <Dialog
            open={Boolean(pendingDeviceAction)}
            onClose={() => !deviceActionId && setPendingDeviceAction(null)}
        >
            <DialogTitle>
                {pendingDeviceAction?.is_active ? "Отключить SMS-телефон?" : "Удалить SMS-телефон?"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {pendingDeviceAction?.is_active
                        ? `Телефон «${pendingDeviceAction.device_name || "Android-телефон"}» перестанет получать команды на отправку SMS.`
                        : `Запись о телефоне «${pendingDeviceAction?.device_name || "Android-телефон"}» будет удалена без возможности восстановления.`}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button disabled={Boolean(deviceActionId)} onClick={() => setPendingDeviceAction(null)}>
                    Отмена
                </Button>
                <Button
                    variant="contained"
                    color={pendingDeviceAction?.is_active ? "warning" : "error"}
                    disabled={Boolean(deviceActionId)}
                    onClick={() => changeDeviceState(pendingDeviceAction)}
                >
                    {pendingDeviceAction?.is_active ? "Отключить" : "Удалить"}
                </Button>
            </DialogActions>
        </Dialog>

        <Grid item xs={12}>
            <Accordion disableGutters elevation={1}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                    <div>
                        <Typography variant="h5">Журнал SMS Gateway</Typography>
                        <Typography variant="body2">Последние пять SMS и системных событий</Typography>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    {auditEvents.length === 0 && <Typography variant="body2">Событий пока нет.</Typography>}
                    {auditGroups.slice(0, 5).map(group => {
                        const latest = group.latest;
                        const deviceName = latest.mobile_device_id && devices.find(device => +device.id === +latest.mobile_device_id)?.device_name;

                        if (!group.isSms) return <Paper key={group.key} style={{padding: "0.75rem 1rem", marginTop: "0.5rem"}}>
                            <Typography>{auditEventLabels[latest.event_type] || latest.event_type}</Typography>
                            <Typography variant="body2">
                                {formatLastSeen(latest.created_at)}{deviceName ? " \u00b7 " + deviceName : ""}
                            </Typography>
                        </Paper>;

                        return <Accordion key={group.key} disableGutters elevation={1} style={{marginTop: "0.5rem"}}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                <div>
                                    <Typography>{auditEventLabels[latest.event_type] || latest.event_type}</Typography>
                                    {group.message && <Typography variant="body2" style={{marginTop: "0.35rem", whiteSpace: "pre-wrap"}}>
                                        {"\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435:"} {group.message}
                                    </Typography>}
                                    <Typography variant="body2" style={{marginTop: group.message ? "0.35rem" : 0}}>
                                        {formatLastSeen(latest.created_at)}{deviceName ? " \u00b7 " + deviceName : ""}
                                    </Typography>
                                </div>
                            </AccordionSummary>
                            <AccordionDetails>
                                {group.events.length === 1 && <Typography variant="body2">{"\u0414\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0445 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439 \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442."}</Typography>}
                                {group.events.slice(1).map(event => <Typography key={event.id} variant="body2" style={{marginTop: "0.35rem"}}>
                                    {formatLastSeen(event.created_at)} {"\u2014"} {auditEventLabels[event.event_type] || event.event_type}
                                </Typography>)}
                            </AccordionDetails>
                        </Accordion>;
                    })}
                </AccordionDetails>
            </Accordion>
        </Grid>

        <Grid item xs={12}>
            <Typography variant="body2">
                Перед установкой ознакомьтесь с <Link href={PRIVACY_URL} target="_blank" rel="noreferrer">политикой конфиденциальности</Link>
                {" и "}<Link href={TERMS_URL} target="_blank" rel="noreferrer">условиями использования Uchet SMS Gateway</Link>.
            </Typography>
        </Grid>
    </Grid>;
};

export default connect(state => state)(IntegrationSmsPhone);
