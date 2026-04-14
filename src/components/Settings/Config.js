import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Checkbox,
    Collapse,
    FormControlLabel,
    Grid,
    InputAdornment,
    TextField,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useSnackbar } from "notistack";

import rest from "../Rest";

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
});

const sections = [
    {
        title: "Ремонт",
        fields: [
            { name: "rem_sum", label: "Стоимость ремонта по умолчанию", end: "RUR" },
            { name: "rem_assessed_value", label: "Оценочная стоимость оборудования", end: "RUR" },
            { name: "remont_warranty", label: "Срок гарантии", end: "дней" },
            { name: "free_save", label: "Срок бесплатного хранения после ремонта", end: "дней" },
            { name: "cost_after_free", label: "Стоимость хранения после бесплатного срока", end: "RUR" },
            { name: "prepayment", label: "Предоплата", end: "RUR" },
            { name: "time_remont", label: "Срок ремонта", end: "дней" },
            { name: "days_after_finished_notification", label: "Уведомление после готовности", end: "дней" },
        ],
    },
    {
        title: "Залог",
        fields: [
            { name: "zalog_min_sum", label: "Минимальная переплата за залог", end: "RUR" },
            { name: "zalog_day_percent", label: "Ежедневный процент за залог", end: "%" },
        ],
    },
    {
        title: "Зарплата за заказы",
        fields: [
            { name: "zp_for_take", label: "Включить зарплату за приемку", type: "checkbox" },
            { name: "zp_take_min_sum", label: "Минимальная сумма выгодного заказа", end: "RUR" },
            { name: "zp_for_take_sum", label: "Сумма за прием заказа по точкам", end: "RUR", type: "text" },
            { name: "zp_add_part", label: "Сумма за внесение запчастей", end: "RUR" },
            { name: "zp_for_checkout", label: "Включить зарплату за закрытие", type: "checkbox" },
            { name: "zp_saler_per", label: "Процент за закрытие заказа", end: "%" },
            { name: "zp_master_per", label: "Процент мастеру за выполнение заказа", end: "%" },
            { name: "zp_repeat_per", label: "Уменьшение процента мастеру при гарантии", end: "%" },
            { name: "zp_daily_min", label: "Минимальная зарплата продавца-приемщика в день", end: "RUR" },
        ],
    },
    {
        title: "Зарплата за товары",
        fields: [
            { name: "zp_salary_buy", label: "За покупку техники", end: "RUR" },
            { name: "zp_salary_zalog", label: "За залог", end: "RUR" },
            { name: "zp_salary_sell", label: "За продажу техники", end: "%" },
            { name: "zp_salary_goods", label: "За продажу аксессуаров", end: "%" },
        ],
    },
    {
        title: "Гарантийные обязательства",
        fields: [
            { name: "goods_phones_warranty", label: "Гарантийный срок при продаже техники", end: "дней" },
            { name: "goods_accessories_warranty", label: "Гарантийный срок при продаже остальных товаров", end: "дней" },
        ],
    },
    {
        title: "Помощь",
        fields: [
            { name: "need_help", label: "Показывать подсказки", type: "checkbox" },
        ],
    },
];

const toStringValue = value => value === null || value === undefined ? "" : value.toString();

const isChecked = value => value === true || value === 1 || value === "1";

// TODO: Add a dedicated editor for JSON config values, for example salaries by stock.
const isJsonValue = value => {
    if (typeof value !== "string") return false;

    const v = value.trim();
    return (v.startsWith("{") && v.endsWith("}")) || (v.startsWith("[") && v.endsWith("]"));
};

const SimpleCard = ({ title, children }) => {
    const [expanded, setExpanded] = useState(true);
    const classes = useStyles();

    return <Card className={classes.card}>
        <CardActions
            onClick={() => setExpanded(prev => !prev)}
            aria-expanded={expanded}
            style={{ padding: 0 }}
        >
            <CardHeader
                title={title}
                className={classes.cardHeader}
                titleTypographyProps={{ variant: "subtitle1" }}
            />
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent>
                <Grid container spacing={2}>
                    {children}
                </Grid>
            </CardContent>
        </Collapse>
    </Card>;
};

const ConfigField = ({ field, value, disabled, onChange, onSave }) => {
    const classes = useStyles();

    if (field.type === "checkbox") {
        return <Grid item xs={12} sm={6}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={isChecked(value)}
                        onChange={event => onSave(field.name, event.target.checked ? "1" : "0")}
                        color="primary"
                        disabled={disabled}
                    />
                }
                label={field.label}
            />
        </Grid>;
    }

    return <Grid item xs={12} sm={6}>
        <TextField
            label={field.label}
            value={toStringValue(value)}
            type={field.type === "text" ? "text" : "number"}
            variant="outlined"
            size="small"
            fullWidth
            className={classes.field}
            disabled={disabled}
            onChange={event => onChange(field.name, event.target.value)}
            onBlur={() => onSave(field.name)}
            InputProps={field.end ? {
                endAdornment: <InputAdornment position="end">{field.end}</InputAdornment>,
            } : undefined}
        />
    </Grid>;
};

const Config = props => {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const config = props.config || {};
    const [localConfig, setLocalConfig] = useState(config);
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    const updateField = (name, value) => {
        setLocalConfig(prev => ({ ...prev, [name]: value }));
    };

    const saveField = (name, value = localConfig[name]) => {
        const nextValue = toStringValue(value);

        if (requesting) return;
        if (toStringValue(config[name]) === nextValue) return;

        setRequesting(true);
        setLocalConfig(prev => ({ ...prev, [name]: nextValue }));

        rest("config", "PATCH", { [name]: nextValue })
            .then(res => {
                if (res.status < 300) {
                    enqueueSnackbar("Настройки сохранены", { variant: "success" });
                    return;
                }

                setLocalConfig(config);
                enqueueSnackbar("Ошибка сохранения настроек", { variant: "error" });
            })
            .catch(() => {
                setLocalConfig(config);
                enqueueSnackbar("Ошибка сети", { variant: "error" });
            })
            .finally(() => setRequesting(false));
    };

    return <div className={classes.root}>
        {sections.map(section => <SimpleCard
            title={section.title}
            key={"settings-config-section-" + section.title}
        >
            {section.fields
                .filter(field => !isJsonValue(localConfig[field.name]))
                .map(field => <ConfigField
                    key={"settings-config-field-" + field.name}
                    field={field}
                    value={localConfig[field.name]}
                    disabled={requesting}
                    onChange={updateField}
                    onSave={saveField}
                />)}
        </SimpleCard>)}
    </div>;
};

export default connect(state => state.app)(Config);
