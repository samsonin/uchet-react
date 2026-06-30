import React, { useState } from "react";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import { makeStyles } from "muiLegacyStyles";
import { useSnackbar } from "notistack";

import {
    getPrintPageDimensions,
    getSavedPrintSettings,
    PRINT_PRESETS,
    savePrintSettings,
} from "../common/PrintSettings";

const useStyles = makeStyles({
    root: {
        width: "100%",
        margin: "0.5rem",
    },
    card: {
        marginBottom: 10,
    },
    cardHeader: {
        backgroundColor: "#F7F7F7",
        borderBottom: "1px solid #e9ecef",
    },
    field: {
        width: "100%",
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        marginTop: 16,
    },
    preview: {
        color: "#657482",
        marginTop: 8,
    },
});

const printTypes = [
    {
        type: "document",
        title: "Документы",
        description: "Используется для заказов, залогов и других обычных документов.",
    },
    {
        type: "receipt",
        title: "Чеки",
        description: "Используется для чеков и документов закрытия заказа. По умолчанию ширина 57 мм.",
    },
    {
        type: "priceTag",
        title: "Ценники",
        description: "Используется для печати ценников.",
    },
    {
        type: "barcode",
        title: "Штрихкоды",
        description: "Используется для печати этикеток со штрихкодами.",
    },
];

const getNextSettings = (current, field, value) => {
    const next = {
        ...current,
        [field]: value,
    };

    if (field === "preset" && value !== "custom") {
        const preset = PRINT_PRESETS[value];

        next.width = preset.width;
        next.height = preset.height;
    }

    return next;
};

const PrintSettingsCard = ({ config, onChange, onSave }) => {
    const classes = useStyles();
    const isCustom = config.settings.preset === "custom";
    const dimensions = getPrintPageDimensions(config.settings);

    return <Card className={classes.card}>
        <CardHeader
            title={config.title}
            className={classes.cardHeader}
            titleTypographyProps={{ variant: "subtitle1" }}
        />
        <CardContent>
            <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                {config.description}
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl variant="outlined" size="small" className={classes.field}>
                        <InputLabel id={`${config.type}-paper-label`}>Бумага</InputLabel>
                        <Select
                            labelId={`${config.type}-paper-label`}
                            value={config.settings.preset}
                            onChange={event => onChange(config.type, "preset", event.target.value)}
                            label="Бумага"
                        >
                            {Object.entries(PRINT_PRESETS).map(([value, preset]) => <MenuItem
                                key={`${config.type}-preset-${value}`}
                                value={value}
                            >
                                {preset.label}
                            </MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl variant="outlined" size="small" className={classes.field}>
                        <InputLabel id={`${config.type}-orientation-label`}>Ориентация</InputLabel>
                        <Select
                            labelId={`${config.type}-orientation-label`}
                            value={config.settings.orientation}
                            onChange={event => onChange(config.type, "orientation", event.target.value)}
                            label="Ориентация"
                        >
                            <MenuItem value="portrait">Книжная</MenuItem>
                            <MenuItem value="landscape">Альбомная</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <TextField
                        label="Ширина, мм"
                        value={config.settings.width}
                        type="number"
                        variant="outlined"
                        size="small"
                        fullWidth
                        disabled={!isCustom}
                        onChange={event => onChange(config.type, "width", event.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <TextField
                        label="Высота, мм"
                        value={config.settings.height}
                        type="number"
                        variant="outlined"
                        size="small"
                        fullWidth
                        disabled={!isCustom}
                        onChange={event => onChange(config.type, "height", event.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <TextField
                        label="Поля, мм"
                        value={config.settings.margin}
                        type="number"
                        variant="outlined"
                        size="small"
                        fullWidth
                        onChange={event => onChange(config.type, "margin", event.target.value)}
                    />
                </Grid>
            </Grid>
            <Typography variant="caption" className={classes.preview}>
                Итоговый размер: {dimensions.width} x {dimensions.height} мм
            </Typography>
            <div className={classes.actions}>
                <Button color="primary" variant="contained" onClick={() => onSave(config.type)}>
                    Сохранить
                </Button>
            </div>
        </CardContent>
    </Card>;
};

const Print = () => {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const [settings, setSettings] = useState({
        document: getSavedPrintSettings("document"),
        receipt: getSavedPrintSettings("receipt"),
        priceTag: getSavedPrintSettings("priceTag"),
        barcode: getSavedPrintSettings("barcode"),
    });

    const handleChange = (type, field, value) => {
        setSettings(prev => ({
            ...prev,
            [type]: getNextSettings(prev[type], field, value),
        }));
    };

    const handleSave = type => {
        const saved = savePrintSettings(type, settings[type]);

        setSettings(prev => ({
            ...prev,
            [type]: saved,
        }));

        enqueueSnackbar("Параметры печати сохранены", { variant: "success" });
    };

    return <div className={classes.root}>
        {printTypes.map(config => <PrintSettingsCard
            key={`print-settings-${config.type}`}
            config={{
                ...config,
                settings: settings[config.type],
            }}
            onChange={handleChange}
            onSave={handleSave}
        />)}
    </div>;
};

export default Print;
