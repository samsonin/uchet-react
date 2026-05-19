import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";

import AddIcon from "@mui/icons-material/Add";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import { useSnackbar } from "notistack";

import { PASSPORT_OCR_PATH } from "../../constants";
import ReferalSelect from "../ReferalSelect";
import rest from "../Rest";
import { fioHandler, phoneNumberHandler } from "../common/InputHandlers";
import CustomerContacts from "./Contacts";
import { normalizePassportPayload } from "./passportOcr";

const customerSelectFields = ["id", "fio", "phone_number", "contacts"];
const SEARCH_DEBOUNCE_MS = 400;
const CUSTOMER_FROM_BASE_LABEL = "Заказчик из базы";
const NEW_CUSTOMER_LABEL = "Новый заказчик";
const EDIT_CUSTOMER_LABEL = "Редактировать заказчика";
const CONTACTS_LABEL = "Доп. контакты";
const ADD_CONTACT_LABEL = "Добавить контакт";
const DOC_PHOTO_LABEL = "Документ";
const RECOGNIZING_LABEL = "Распознаем...";

const types = {
    birthday: "date",
    doc_date: "date",
};

const wideFields = new Set(["fio", "address", "birth_place", "doc_division_name"]);

const fallbackContactTypes = [
    { code: "telegram", name: "Telegram", icon: "telegram" },
    { code: "instagram", name: "Instagram", icon: "instagram" },
    { code: "whatsapp", name: "WhatsApp", icon: "whatsapp" },
    { code: "phone", name: "Телефон", icon: "phone" },
    { code: "email", name: "Email", icon: "email" },
    { code: "other", name: "Другой", icon: "chat" },
];

const hasCustomerValue = value => Boolean(
    value && typeof value === "object" && Object.values(value).some(Boolean)
);

const emptyContact = () => ({
    type: fallbackContactTypes[0],
    value: "",
    label: "",
    is_primary: false,
    meta: null,
});

const normalizeContactType = type => {
    if (!type || typeof type !== "object") return null;

    return {
        ...type,
        code: type.code || type.icon || String(type.id || ""),
        name: type.name || type.code || type.icon || String(type.id || ""),
        icon: type.icon || type.code || "chat",
    };
};

const CustomerForm = props => {
    const request = useRef(false);
    const debounceRef = useRef(null);
    const requestIdRef = useRef(0);
    const documentInputRef = useRef(null);
    const { enqueueSnackbar } = useSnackbar();

    const [customers, setCustomers] = useState([]);
    const [value, setValue] = useState(null);
    const [isDetails, setIsDetails] = useState(props.details ?? props.defaultDetails ?? !props.customer.id);
    const [isRecognizingDocument, setIsRecognizingDocument] = useState(false);

    const isExistingCustomer = Boolean(props.customer.id);
    const lockExistingCustomer = props.lockExistingCustomer ?? true;
    const canEditCustomer = !props.disabled && (!isExistingCustomer || !lockExistingCustomer);
    const contacts = Array.isArray(props.customer.contacts) ? props.customer.contacts : [];
    const showDetailedFields = props.variant === "detailed" || props.variant === "page";
    const showHeader = props.showHeader !== false && !props.onlySearch;
    const showSearch = props.showSearch !== false;
    const showContactsEditor = Boolean(props.allowAdditionalContacts);
    const contactTypes = Array.isArray(props.contactTypes) && props.contactTypes.length
        ? props.contactTypes.map(normalizeContactType).filter(Boolean)
        : fallbackContactTypes;

    const fields = (props.allElements || [])
        .filter(field => field.index === "customer" && field.is_valid)
        .filter(field => showDetailedFields && (isDetails || ["fio", "phone_number"].includes(field.name)));

    const setCustomerPatch = patch => {
        props.setCustomer(prev => ({
            ...prev,
            ...patch,
        }));
    };

    const upd = (name, val) => {
        setCustomerPatch({ [name]: val });
    };

    useEffect(() => {
        setValue(hasCustomerValue(props.customer) ? props.customer : null);
        setCustomers([]);
    }, [props.customer]);

    useEffect(() => {
        if (props.details !== undefined) setIsDetails(props.details);
    }, [props.details]);

    useEffect(() => () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
    }, []);

    const searchCustomers = val => {
        const requestId = ++requestIdRef.current;
        request.current = true;

        rest("customers?details=1&with_contacts=1&all=" + encodeURIComponent(val))
            .then(res => {
                if (requestId !== requestIdRef.current) return;

                request.current = false;
                if (res.ok) setCustomers(res.body || []);
            })
            .catch(() => {
                if (requestId !== requestIdRef.current) return;
                request.current = false;
                setCustomers([]);
            });
    };

    const handlerInput = (val, reason, name) => {
        if (reason === "clear") {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            requestIdRef.current++;
            request.current = false;
            setCustomers([]);
            props.setCustomer({ id: 0, phone_number: "", fio: "", contacts: [] });
            setValue(null);
            return;
        }

        if (reason !== "input") return;

        if (name === "phone_number") val = phoneNumberHandler(val);
        if (name === "fio") val = fioHandler(val);

        upd(name, val);

        if (!showSearch) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (val.length < 6) {
            requestIdRef.current++;
            request.current = false;
            setCustomers([]);
            return;
        }

        debounceRef.current = setTimeout(() => {
            searchCustomers(val);
        }, SEARCH_DEBOUNCE_MS);
    };

    const handler = val => {
        setValue(val || null);
        if (val) props.setCustomer(customerSelectFields.reduce((acc, field) => {
            acc[field] = val[field] ?? (field === "contacts" ? [] : "");
            return acc;
        }, {}));
        setCustomers([]);
    };

    const openCustomer = () => {
        if (!props.customer.id) return;
        window.open(`/customers/${props.customer.id}`, "_blank", "noopener,noreferrer");
    };

    const addContact = () => {
        if (!canEditCustomer) return;
        setCustomerPatch({ contacts: [...contacts, {...emptyContact(), type: contactTypes[0]}] });
    };

    const updateContact = (index, patch) => {
        if (!canEditCustomer) return;
        setCustomerPatch({
            contacts: contacts.map((contact, contactIndex) =>
                contactIndex === index ? { ...contact, ...patch } : contact
            ),
        });
    };

    const removeContact = index => {
        if (!canEditCustomer) return;
        setCustomerPatch({
            contacts: contacts.filter((_, contactIndex) => contactIndex !== index),
        });
    };

    const handleDocumentPhoto = async event => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        setIsRecognizingDocument(true);

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
                enqueueSnackbar("Не удалось распознать данные. Заполните поля вручную.", {
                    variant: "warning",
                });
                return;
            }

            setCustomerPatch(recognizedFields);
            setIsDetails(true);
            enqueueSnackbar("Данные документа распознаны.", {
                variant: "success",
            });
        } catch (error) {
            enqueueSnackbar("Ошибка распознавания документа.", {
                variant: "error",
            });
        } finally {
            setIsRecognizingDocument(false);
        }
    };

    const renderCustomerField = field => {
        const isSearchField = showSearch && ["fio", "phone_number"].includes(field.name);

        if (isSearchField) {
            return <Autocomplete
                key={"customer-form-key" + field.name + field.index + field.value}
                disabled={props.disabled}
                className={showDetailedFields ? "customer-fields-input" : "customers-select-field"}
                fullWidth
                value={value}
                inputValue={props.customer[field.name] ?? ""}
                options={customers}
                loading={request.current}
                loadingText="Поиск заказчиков..."
                noOptionsText="Ничего не найдено"
                filterSelectedOptions={true}
                filterOptions={options => Array.isArray(options) ? options : []}
                slotProps={{
                    paper: {
                        className: "customers-select-paper",
                    },
                    popper: {
                        className: "customers-select-popper",
                    },
                }}
                onInputChange={(e, v, r) => handlerInput(v, r, field.name)}
                onChange={(e, v) => handler(v)}
                getOptionLabel={option => option ? option[field.name] || "" : ""}
                isOptionEqualToValue={(option, selectedValue) =>
                    Boolean(option && selectedValue && option.id === selectedValue.id)
                }
                renderOption={(renderProps, option, state) => (
                    <li
                        {...renderProps}
                        key={`${option?.id || "customer"}-${field.name}-${state.index}`}
                        className={`customers-select-option ${renderProps.className || ""}`}
                    >
                        {option ? option[field.name] || option.fio || option.phone_number || "" : ""}
                    </li>
                )}
                renderInput={params => <TextField
                    {...params}
                    autoComplete="off"
                    label={field.value || field.label}
                    id={"customer-form-key-" + field.name + field.value}
                    name={"customer-form-key-" + field.name + field.value}
                />}
            />;
        }

        if (field.name === "referal_id") {
            return <ReferalSelect
                key={"customer-form-key" + field.name}
                value={props.customer[field.name]}
                onChange={e => upd(field.name, e.target.value)}
            />;
        }

        return <TextField
            className={showDetailedFields ? "customer-fields-input" : "customers-select-field"}
            fullWidth
            key={"customer-form-key" + field.name + field.index + field.value}
            type={types[field.name] || "text"}
            label={field.value || field.label}
            value={props.customer[field.name] || ""}
            disabled={props.disabled}
            onChange={e => {
                if (field.name === "phone_number") return handlerInput(e.target.value, "input", field.name);
                if (field.name === "fio") return handlerInput(e.target.value, "input", field.name);
                upd(field.name, e.target.value);
            }}
        />;
    };

    return <div className={showDetailedFields
        ? props.variant === "page" ? "customer-form-page" : "customer-fields-card"
        : "customers-select"
    }>
        {showHeader && <div className={showDetailedFields ? "customer-fields-card-header" : "customers-select-status"}>
            <span className={showDetailedFields ? "customer-fields-card-title" : undefined}>
                {isExistingCustomer
                    ? props.existingLabel || CUSTOMER_FROM_BASE_LABEL
                    : props.newLabel || NEW_CUSTOMER_LABEL}
            </span>
            <div className="customers-select-status-actions">
                {props.enablePassportOcr && canEditCustomer && <input
                    ref={documentInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="customer-fields-passport-input"
                    onChange={handleDocumentPhoto}
                />}
                {props.enablePassportOcr && canEditCustomer && <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    className={showDetailedFields ? "customer-fields-passport-button" : "customers-select-document-button"}
                    startIcon={isRecognizingDocument ? <CircularProgress size={14} /> : <CameraAltOutlinedIcon />}
                    onClick={() => documentInputRef.current?.click()}
                    disabled={isRecognizingDocument}
                >
                    {isRecognizingDocument ? RECOGNIZING_LABEL : props.documentLabel || DOC_PHOTO_LABEL}
                </Button>}
                {isExistingCustomer && lockExistingCustomer && <Tooltip title={EDIT_CUSTOMER_LABEL}>
                    <IconButton
                        size="small"
                        className="customers-select-edit-button"
                        aria-label={EDIT_CUSTOMER_LABEL}
                        onClick={openCustomer}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>}
                {showDetailedFields && props.allowDetailsToggle !== false && <Tooltip title={isDetails ? "Короче" : "Подробнее"}>
                    <IconButton onClick={() => setIsDetails(!isDetails)}>
                        {isDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Tooltip>}
            </div>
        </div>}

        {showDetailedFields
            ? <div className="customer-view-fields">
                {fields.map(field => <div
                    key={"customer-form-field-wrap-" + field.name}
                    className={`customer-view-field ${wideFields.has(field.name) ? "is-wide" : ""}`}
                >
                    {renderCustomerField(field)}
                </div>)}
            </div>
            : [
                { name: "phone_number", label: "Телефон", value: "Телефон", index: "customer" },
                { name: "fio", label: "ФИО", value: "ФИО", index: "customer" },
            ].map(renderCustomerField)}

        {showContactsEditor && <div className="customers-select-contacts">
            <div className="customers-select-contacts-header">
                <span>{CONTACTS_LABEL}</span>
                {canEditCustomer && <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addContact}
                >
                    {ADD_CONTACT_LABEL}
                </Button>}
            </div>

            {contacts.map((contact, index) => <div
                key={`customers-select-contact-${index}`}
                className="customers-select-contact-row"
            >
                <TextField
                    select
                    size="small"
                    className="customers-select-contact-type"
                    label="Тип"
                    value={contact.type?.code || contact.type || contactTypes[0]?.code || ""}
                    disabled={!canEditCustomer}
                    onChange={event => updateContact(index, {
                        type: contactTypes.find(type => type.code === event.target.value) || contactTypes[0],
                    })}
                >
                    {contactTypes.map(type => <MenuItem key={type.code} value={type.code}>
                        {type.name}
                    </MenuItem>)}
                </TextField>
                <TextField
                    size="small"
                    className="customers-select-contact-value"
                    label="Значение"
                    value={contact.value || ""}
                    disabled={!canEditCustomer}
                    onChange={event => updateContact(index, { value: event.target.value })}
                />
                {canEditCustomer && <IconButton
                    className="customers-select-contact-remove"
                    onClick={() => removeContact(index)}
                    aria-label="Удалить контакт"
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>}
            </div>)}
        </div>}

        {!showContactsEditor && <CustomerContacts contacts={props.customer.contacts} dense={showDetailedFields} />}
    </div>;
};

export default connect(state => ({
    ...(state.app.fields || {}),
    contactTypes: state.app.contact_types || [],
}))(CustomerForm);
