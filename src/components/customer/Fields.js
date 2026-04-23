import React, { useRef, useState } from "react";
import { connect } from "react-redux";

import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import TextField from "@mui/material/TextField";
import { Autocomplete, Button, CircularProgress } from "@mui/material";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import { useSnackbar } from "notistack";

import rest from "../Rest";
import { fioHandler, phoneNumberHandler } from "../common/InputHandlers";
import { PASSPORT_OCR_PATH } from "../../constants";

const types = {
    birthday: "date",
    doc_date: "date",
};

const passportFieldAliases = {
    fio: ["fio", "full_name", "name"],
    birthday: ["birthday", "birth_date", "date_of_birth"],
    birth_place: ["birth_place", "birthplace", "place_of_birth"],
    doc_sn: ["doc_sn", "passport_number", "series_number", "document_number"],
    doc_date: ["doc_date", "issue_date", "passport_issue_date"],
    doc_division_name: ["doc_division_name", "issued_by", "passport_issued_by"],
    doc_division_code: ["doc_division_code", "department_code", "passport_department_code"],
    address: ["address", "registration_address", "registered_address"],
};

let outCount = 0;
let inCount = 0;

const normalizePassportPayload = body => {
    const source = body?.fields || body?.data?.fields || body?.data || body?.result || body;
    if (!source || typeof source !== "object" || Array.isArray(source)) return {};

    return Object.entries(passportFieldAliases).reduce((acc, [fieldName, aliases]) => {
        const value = aliases
            .map(alias => source[alias])
            .find(candidate => candidate !== undefined && candidate !== null && String(candidate).trim() !== "");

        if (value !== undefined) {
            acc[fieldName] = String(value).trim();
        }

        return acc;
    }, {});
};

const Fields = props => {
    const request = useRef(false);
    const passportInputRef = useRef(null);
    const { enqueueSnackbar } = useSnackbar();

    const [isDetails, setIsDetails] = useState(!props.customer.id);
    const [customers, setCustomers] = useState([]);
    const [isRecognizingPassport, setIsRecognizingPassport] = useState(false);

    const handler = (name, val) => {
        if (name === "phone_number") val = phoneNumberHandler(val);
        if (name === "fio") val = fioHandler(val);

        if (props.customer.id) return;

        const newCustomer = { ...props.customer };
        newCustomer[name] = val;
        props.setCustomer(newCustomer);
    };

    const onInputChangeAutocomplete = (value, reason, name) => {
        if (reason !== "input") return;

        handler(name, value);

        if (value.length < 6) return;

        request.current = true;
        outCount++;

        rest("customers?details=1&all=" + value)
            .then(res => {
                request.current = false;
                inCount++;
                if (res.ok && outCount === inCount) {
                    setCustomers(res.body || []);
                }
            });
    };

    const onChangeAutocomplete = (value, reason) => {
        if (reason === "clear") {
            props.setCustomer({});
        }

        if (reason !== "select-option") return;

        props.setCustomer(value);
    };

    const handlePassportPhoto = async event => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        setIsRecognizingPassport(true);

        try {
            const formData = new FormData();
            formData.append("image", file);

            const res = await rest(PASSPORT_OCR_PATH, "POST", formData, false, {
                bodyType: "formData",
                updateStore: false,
                responseType: "auto",
            });

            const recognizedFields = normalizePassportPayload(res.body);

            if (!res.ok || !Object.keys(recognizedFields).length) {
                enqueueSnackbar("Не удалось распознать паспортные данные. Проверь фото и заполните поля вручную.", {
                    variant: "warning",
                });
                return;
            }

            props.setCustomer({
                ...props.customer,
                ...recognizedFields,
            });

            setIsDetails(true);
            enqueueSnackbar("Паспортные данные распознаны. Проверьте и при необходимости исправьте поля.", {
                variant: "success",
            });
        } catch (error) {
            enqueueSnackbar("Ошибка распознавания паспорта. Попробуйте еще раз.", {
                variant: "error",
            });
        } finally {
            setIsRecognizingPassport(false);
        }
    };

    return <div className="customer-fields-card">
        <div className="customer-fields-card-header">
            <span className="customer-fields-card-title">
                {props.customer.id ? "Клиент из базы" : "Новый клиент"}
            </span>

            <div className="customer-fields-card-actions">
                {props.enablePassportOcr && !props.customer.id && <input
                    ref={passportInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="customer-fields-passport-input"
                    onChange={handlePassportPhoto}
                />}

                {props.enablePassportOcr && !props.customer.id && <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    className="customer-fields-passport-button"
                    startIcon={isRecognizingPassport ? <CircularProgress size={14} /> : <CameraAltOutlinedIcon />}
                    onClick={() => passportInputRef.current?.click()}
                    disabled={isRecognizingPassport}
                >
                    {isRecognizingPassport ? "Распознаем..." : "Фото паспорта"}
                </Button>}

                <Tooltip title={isDetails ? "Короче" : "Подробнее"}>
                    <IconButton onClick={() => setIsDetails(!isDetails)}>
                        {isDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Tooltip>
            </div>
        </div>

        {props.enablePassportOcr && !props.customer.id && <div className="customer-fields-passport-hint">
            Лучший результат дает фото разворота без бликов, целиком в кадре.
        </div>}

        {props.allElements
            .filter(field => field.index === "customer" && field.is_valid)
            .filter(field => isDetails || ["fio", "phone_number"].includes(field.name))
            .map(field => ["fio", "phone_number"].includes(field.name)
                ? <Autocomplete
                    key={"customer-fields-key" + field.name + field.index + field.value}
                    className="customer-fields-input"
                    fullWidth
                    inputValue={props.customer[field.name] ?? ""}
                    options={customers}
                    loading={request.current}
                    onInputChange={(e, v, r) => {
                        onInputChangeAutocomplete(v, r, field.name);
                    }}
                    onChange={(e, v, r) => {
                        onChangeAutocomplete(v, r);
                    }}
                    getOptionLabel={option => option ? option[field.name] : ""}
                    isOptionEqualToValue={(option, selectedValue) =>
                        Boolean(option && selectedValue && option.id === selectedValue.id)
                    }
                    renderInput={params => <TextField
                        {...params}
                        label={field.value}
                    />}
                />
                : <TextField
                    className="customer-fields-input"
                    fullWidth
                    key={"customer-fields-key" + field.name + field.index + field.value}
                    type={types[field.name] || "text"}
                    label={field.value}
                    value={props.customer[field.name] || ""}
                    onChange={e => handler(field.name, e.target.value)}
                />
            )}
    </div>;
};

export default connect(state => state.app.fields)(Fields);
