import React, {useState} from "react";
import {connect} from "react-redux";
import {QRCodeCanvas} from "qrcode.react";
import {
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import LinkIcon from "@mui/icons-material/Link";
import {useSnackbar} from "notistack";

import rest from "./Rest";
import StocksSelect from "./common/StocksSelect";
import {
    buildMobileDevicePairingPayload,
    getMobileDeviceQrPayload,
    isSuccessfulPairingCodeResponse,
} from "./mobileDevicePairing";

const formatExpiresAt = value => {
    if (!value) return "";

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const IntegrationSmsPhone = props => {
    const validStocks = (props.app.stocks || []).filter(stock => stock.is_valid !== false);
    const defaultStock = props.app.current_stock_id || validStocks[0]?.id || 0;
    const [stockId, setStockId] = useState(defaultStock);
    const [pairingCode, setPairingCode] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const {enqueueSnackbar} = useSnackbar();
    const qrPayload = getMobileDeviceQrPayload(pairingCode);

    const createPairingCode = () => {
        setLoading(true);

        rest("mobile-devices/pairing-codes", "POST", buildMobileDevicePairingPayload(stockId), false, {
            updateStore: false,
        }).then(res => {
            setLoading(false);

            if (isSuccessfulPairingCodeResponse(res)) {
                setPairingCode(res.body);
                return;
            }

            enqueueSnackbar(res.body?.message || res.body?.error || "Не удалось создать код подключения", {
                variant: "error",
            });
        });
    };

    return <Grid container spacing={2} className="w-100">
        <Grid item xs={12}>
            <Typography variant="h4">
                Подключение SMS-телефона
            </Typography>
        </Grid>

        <Grid item xs={12}>
            <Typography variant="body1">
                Создайте одноразовый QR-код и отсканируйте его в Android-приложении через действие
                {" "}«Подключить SMS-телефон». Код действует ограниченное время.
            </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
            {validStocks.length > 1
                ? <StocksSelect
                    stocks={validStocks}
                    stock={stockId}
                    setStock={setStockId}
                    classes="w-100"
                />
                : <FormControl className="w-100">
                    <InputLabel id="sms-phone-stock-label">Точка</InputLabel>
                    <Select
                        labelId="sms-phone-stock-label"
                        value={stockId || ""}
                        label="Точка"
                        onChange={e => setStockId(e.target.value)}
                    >
                        {validStocks.map(stock => <MenuItem
                            key={"sms-phone-stock-" + stock.id}
                            value={stock.id}
                        >
                            {stock.name}
                        </MenuItem>)}
                    </Select>
                </FormControl>}
        </Grid>

        <Grid item xs={12}>
            <Button
                variant="contained"
                color="primary"
                disabled={isLoading}
                onClick={createPairingCode}
                startIcon={pairingCode ? <RefreshIcon/> : <LinkIcon/>}
            >
                {pairingCode ? "Обновить код" : "Создать код подключения"}
            </Button>
        </Grid>

        {qrPayload && <Grid item xs={12}>
            <Paper style={{padding: "1rem", display: "inline-block"}}>
                <QRCodeCanvas value={qrPayload} size={256} includeMargin/>
            </Paper>
            <Typography variant="h5" style={{marginTop: "1rem"}}>
                {pairingCode.code}
            </Typography>
            {pairingCode.expires_at && <Typography variant="body2">
                Действует до: {formatExpiresAt(pairingCode.expires_at)}
            </Typography>}
        </Grid>}
    </Grid>;
};

export default connect(state => state)(IntegrationSmsPhone);
