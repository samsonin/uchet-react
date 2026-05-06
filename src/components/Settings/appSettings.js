import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    FormControlLabel,
    Grid,
    Slider,
    Switch,
    Typography,
} from "@mui/material";
import { makeStyles } from "muiLegacyStyles";

import {
    applyAppSettings,
    defaultAppSettings,
    getAppSettings,
    saveAppSettings,
} from "./appSettingsStore";

const useStyles = makeStyles({
    root: {
        width: "100%",
        maxWidth: 760,
        margin: "0.5rem",
    },
    card: {
        marginBottom: 10,
    },
    cardHeader: {
        backgroundColor: "#F7F7F7",
        borderBottom: "1px solid #e9ecef",
    },
    row: {
        marginBottom: 18,
    },
    helper: {
        color: "var(--text-muted)",
        marginTop: 6,
    },
    preview: {
        padding: "0.75rem 0.9rem",
        border: "1px solid var(--line)",
        borderRadius: 12,
        background: "var(--surface-soft)",
        color: "var(--text)",
    },
});

const AppSettings = () => {
    const classes = useStyles();
    const [settings, setSettings] = useState(() => getAppSettings());

    useEffect(() => {
        applyAppSettings(settings);
    }, [settings]);

    const update = patch => {
        setSettings(prev => saveAppSettings({
            ...prev,
            ...patch,
        }));
    };

    const resetFontSize = () => update({ fontSize: defaultAppSettings.fontSize });

    return (
        <div className={classes.root}>
            <Card className={classes.card}>
                <CardHeader
                    title="Интерфейс"
                    className={classes.cardHeader}
                    titleTypographyProps={{ variant: "h6" }}
                />
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid size={12} className={classes.row}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.assistantEnabled}
                                        onChange={event => update({ assistantEnabled: event.target.checked })}
                                        color="primary"
                                    />
                                }
                                label="Показывать помощника"
                            />
                            <Typography variant="body2" className={classes.helper}>
                                Если выключить помощника, кнопка чата справа внизу исчезнет.
                            </Typography>
                        </Grid>

                        <Grid size={12} className={classes.row}>
                            <Typography variant="subtitle1">
                                Размер шрифта приложения: {settings.fontSize}px
                            </Typography>
                            <Slider
                                value={settings.fontSize}
                                min={14}
                                max={20}
                                step={1}
                                marks={[
                                    { value: 14, label: "14" },
                                    { value: 16, label: "16" },
                                    { value: 20, label: "20" },
                                ]}
                                onChange={(event, value) => update({ fontSize: value })}
                                aria-label="Размер шрифта приложения"
                            />
                            <button
                                type="button"
                                className="app-settings-reset"
                                onClick={resetFontSize}
                            >
                                Вернуть 16px
                            </button>
                        </Grid>

                        <Grid size={12}>
                            <div className={classes.preview}>
                                Так будет выглядеть основной текст приложения при выбранном размере шрифта.
                            </div>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </div>
    );
};

export default AppSettings;
