import React from "react";
import {Link as RouterLink} from "react-router-dom";
import {Button, Grid, Link, Paper, Typography} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";

const APK_URL = "https://f005.backblazeb2.com/file/uchet-store/mobile/uchet-sms-phone-latest.apk";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=store.uchet.app";
const PRIVACY_URL = "https://uchet.store/privacy";

const IntegrationSmsPhoneApp = () => <Grid container spacing={2} className="w-100">
    <Grid item xs={12}>
        <Typography variant="h4">Для Android</Typography>
    </Grid>

    <Grid item xs={12} md={8}>
        <Paper style={{padding: "1rem"}}>
            <Typography variant="h5">Установите приложение</Typography>
            <Typography variant="body2" style={{marginTop: "0.5rem"}}>
                Работайте с заказами, клиентами, складом, кассой и остальными разделами Учет с телефона.
                Приложение поддерживает Android 7.0 и новее.
            </Typography>
            <Grid container spacing={1} style={{marginTop: "0.5rem"}}>
                <Grid item>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon/>}
                        href={APK_URL}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Скачать для Android
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

    <Grid item xs={12} md={8}>
        <Paper style={{padding: "1rem"}}>
            <Typography variant="h5">SMS-телефон</Typography>
            <Typography variant="body2" component="ol" style={{marginTop: "0.5rem", paddingLeft: "1.25rem"}}>
                <li>Установите Учет и разрешите отправку SMS.</li>
                <li>В CRM создайте QR-код для нужной точки.</li>
                <li>В приложении отсканируйте QR-код.</li>
            </Typography>
            <Button
                component={RouterLink}
                to="/integration/sms-phone"
                variant="outlined"
                startIcon={<PhoneAndroidIcon/>}
                style={{marginTop: "0.75rem"}}
            >
                Открыть подключение SMS-телефона
            </Button>
        </Paper>
    </Grid>

    <Grid item xs={12} md={8}>
        <Typography variant="body2">
            Для отправки SMS нужен телефон с SIM-картой и доступом к интернету. Перед установкой ознакомьтесь с <Link href={PRIVACY_URL} target="_blank" rel="noreferrer">политикой конфиденциальности</Link>.
        </Typography>
    </Grid>
</Grid>;

export default IntegrationSmsPhoneApp;
