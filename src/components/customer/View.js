import React, {useRef, useState} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";

import {Button, CircularProgress, Paper} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from "@mui/icons-material/Delete";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {useSnackbar} from "notistack";

import ReferalSelect from "../ReferalSelect";
import {BottomButtons} from "../common/BottomButtons";
import TextField from "@mui/material/TextField";
import rest from "../Rest";
import {PASSPORT_OCR_PATH} from "../../constants";

const types = {
    birthday: 'date',
    doc_date: 'date',
}

const wideFields = new Set(['fio', 'address', 'birth_place', 'doc_division_name']);
const PASSPORT_RECOGNIZING_LABEL = "\u0420\u0430\u0441\u043f\u043e\u0437\u043d\u0430\u0435\u043c...";
const PASSPORT_PHOTO_LABEL = "\u0424\u043e\u0442\u043e \u043f\u0430\u0441\u043f\u043e\u0440\u0442\u0430";
const PASSPORT_RECOGNITION_WARNING = "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0440\u0430\u0441\u043f\u043e\u0437\u043d\u0430\u0442\u044c \u043f\u0430\u0441\u043f\u043e\u0440\u0442\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0444\u043e\u0442\u043e \u0438 \u0437\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u043f\u043e\u043b\u044f \u0432\u0440\u0443\u0447\u043d\u0443\u044e.";
const PASSPORT_RECOGNITION_SUCCESS = "\u041f\u0430\u0441\u043f\u043e\u0440\u0442\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435 \u0440\u0430\u0441\u043f\u043e\u0437\u043d\u0430\u043d\u044b. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0438 \u043f\u0440\u0438 \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e\u0441\u0442\u0438 \u0438\u0441\u043f\u0440\u0430\u0432\u044c\u0442\u0435 \u043f\u043e\u043b\u044f.";
const PASSPORT_RECOGNITION_ERROR = "\u041e\u0448\u0438\u0431\u043a\u0430 \u0440\u0430\u0441\u043f\u043e\u0437\u043d\u0430\u0432\u0430\u043d\u0438\u044f \u043f\u0430\u0441\u043f\u043e\u0440\u0442\u0430. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0435 \u0440\u0430\u0437.";
const CUSTOMER_HISTORY_TITLE = "\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0432\u0437\u0430\u0438\u043c\u043e\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439";
const CUSTOMER_HISTORY_EMPTY = "\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u043f\u043e\u043a\u0430 \u043f\u0443\u0441\u0442\u0430";
const OPEN_HISTORY_ITEM_LABEL = "\u041e\u0442\u043a\u0440\u044b\u0442\u044c";
const ORDER_HISTORY_LABEL = "\u0417\u0430\u043a\u0430\u0437\u044b";
const PLEDGE_HISTORY_LABEL = "\u0417\u0430\u043b\u043e\u0433\u0438";
const SALE_HISTORY_LABEL = "\u041f\u0440\u043e\u0434\u0430\u0436\u0438";
const BUY_HISTORY_LABEL = "\u041f\u043e\u043a\u0443\u043f\u043a\u0438";
const UNKNOWN_HISTORY_LABEL = "\u0414\u0440\u0443\u0433\u0438\u0435";

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

const normalizePassportPayload = body => {
    const source = body?.fields || body?.data?.fields || body?.data || body?.result || body;
    if (!source || typeof source !== "object" || Array.isArray(source)) return {};

    return Object.entries(passportFieldAliases).reduce((acc, [fieldName, aliases]) => {
        const value = aliases
            .map(alias => source[alias])
            .find(candidate => candidate !== undefined && candidate !== null && String(candidate).trim() !== "");

        if (value !== undefined) acc[fieldName] = String(value).trim();

        return acc;
    }, {});
};

const mainUrl = document.location.protocol + "//" + document.location.host;

const interactionConfig = table => {
    const normalizedTable = String(table || "").toLowerCase();
    const remMatch = normalizedTable.match(/^rem(\d+)$/);

    if (remMatch) {
        return {
            group: `${ORDER_HISTORY_LABEL}: ${remMatch[1]}`,
            getUrl: id => `/order/${remMatch[1]}/${id}`,
        };
    }

    if (["zalog", "pledge", "pledges"].includes(normalizedTable)) {
        return {
            group: PLEDGE_HISTORY_LABEL,
            getUrl: id => `/pledges/${id}`,
        };
    }

    if (["sale", "sales"].includes(normalizedTable)) {
        return {
            group: SALE_HISTORY_LABEL,
            getUrl: () => "/sales",
        };
    }

    if (["buy", "purchase", "purchases"].includes(normalizedTable)) {
        return {
            group: BUY_HISTORY_LABEL,
            getUrl: () => "/showcase/buy",
        };
    }

    return {
        group: table || UNKNOWN_HISTORY_LABEL,
        getUrl: null,
    };
};

const openHistoryItem = url => {
    if (!url) return;
    window.open(mainUrl + url, "_blank", "noopener,noreferrer");
};

const CustomerHistory = ({history}) => {
    const records = Array.isArray(history) ? history : [];

    return <section className="customer-history">
        <div className="customer-history-title">{CUSTOMER_HISTORY_TITLE}</div>

        {records.length
            ? <div className="customer-history-list">
                {records.map((record, recordIndex) => {
                    const config = interactionConfig(record.table);
                    const ids = Array.isArray(record.id) ? record.id : [record.id].filter(Boolean);

                    return <div
                        key={`customer-history-${record.table}-${recordIndex}`}
                        className="customer-history-group"
                    >
                        <div className="customer-history-group-title">
                            {config.group}
                            {record.count > ids.length && <span className="customer-history-count"> ({record.count})</span>}
                        </div>
                        <div className="customer-history-items">
                            {ids.map(id => {
                                const url = config.getUrl ? config.getUrl(id) : null;

                                return <Button
                                    key={`customer-history-${record.table}-${id}`}
                                    type="button"
                                    size="small"
                                    variant="outlined"
                                    className="customer-history-link"
                                    endIcon={<OpenInNewIcon fontSize="small"/>}
                                    aria-label={`${OPEN_HISTORY_ITEM_LABEL} #${id}`}
                                    onClick={() => openHistoryItem(url)}
                                    disabled={!url}
                                >
                                    #{id}
                                </Button>
                            })}
                        </div>
                    </div>
                })}
            </div>
            : <div className="customer-history-empty">{CUSTOMER_HISTORY_EMPTY}</div>}
    </section>
};

const View = props => {

    const passportInputRef = useRef(null)
    const [isDetails, setDetails] = useState(false)
    const [isRecognizingPassport, setIsRecognizingPassport] = useState(false)
    const {enqueueSnackbar} = useSnackbar()
    const fields = props.allElements
        .filter(field => field.index === 'customer' && field.is_valid)
        .filter(field => isDetails || ['fio', 'phone_number'].includes(field.name))

    const handlePassportPhoto = async event => {
        const file = event.target.files?.[0]
        event.target.value = ""

        if (!file) return

        setIsRecognizingPassport(true)

        try {
            const formData = new FormData()
            formData.append("image", file)

            const res = await rest(PASSPORT_OCR_PATH, "POST", formData, false, {
                bodyType: "formData",
                updateStore: false,
                responseType: "auto",
            })

            const recognizedFields = normalizePassportPayload(res.body)

            if (!res.ok || !Object.keys(recognizedFields).length) {
                enqueueSnackbar(PASSPORT_RECOGNITION_WARNING, {
                    variant: "warning",
                })
                return
            }

            props.setCustomer({
                ...props.customer,
                ...recognizedFields,
            })

            setDetails(true)
            enqueueSnackbar(PASSPORT_RECOGNITION_SUCCESS, {
                variant: "success",
            })
        } catch (error) {
            enqueueSnackbar(PASSPORT_RECOGNITION_ERROR, {
                variant: "error",
            })
        } finally {
            setIsRecognizingPassport(false)
        }
    }

    return <Paper className="customer-view-page">

        {props.remove
            ? <div className="customer-view-header">
                <div className="customer-view-nav">
                    <Tooltip title={'Все физ. лица'}>
                        <Link to="/customers">
                            <IconButton>
                                <ArrowBackIcon/>
                            </IconButton>
                        </Link>
                    </Tooltip>
                    <span className="customer-view-title">
                        {props.customer.id ? `#${props.customer.id}` : 'Новый клиент'}
                    </span>
                </div>

                <div className="customer-view-actions">
                    <input
                        ref={passportInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="customer-fields-passport-input"
                        onChange={handlePassportPhoto}
                    />
                    <Button
                        type="button"
                        size="small"
                        variant="outlined"
                        className="customer-fields-passport-button"
                        startIcon={isRecognizingPassport ? <CircularProgress size={14} /> : <CameraAltOutlinedIcon />}
                        onClick={() => passportInputRef.current?.click()}
                        disabled={isRecognizingPassport || props.customer.id === undefined}
                    >
                        {isRecognizingPassport ? PASSPORT_RECOGNIZING_LABEL : PASSPORT_PHOTO_LABEL}
                    </Button>
                    <Tooltip title="Удалить">
                        <IconButton
                            onClick={() => props.remove()}
                            disabled={props.customer.id === undefined}
                        >
                            <DeleteIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={isDetails ? 'Скрыть подробности' : 'Подробнее'}>
                        <IconButton
                            onClick={() => setDetails(!isDetails)}
                        >
                            {isDetails
                                ? <ExpandLessIcon/>
                                : <ExpandMoreIcon/>
                            }
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            : null}

        <div className="customer-view-fields">
            {fields.map(field => <div
                key={'customer-view-field-wrap-' + field.name}
                className={`customer-view-field ${wideFields.has(field.name) ? 'is-wide' : ''}`}
            >
                {field.name === 'referal_id'
                    ? <ReferalSelect
                        key={'customerfieldskey' + field.name}
                        value={props.customer[field.name]}
                        onChange={e => props.handleChange(field.name, e.target.value)}
                    />
                    : <TextField
                        style={{
                            width: '100%',
                        }}
                        key={'customerfieldskey' + field.name + field.index + field.value}
                        type={types[field.name] || 'text'}
                        label={field.value}
                        value={props.customer[field.name] || ''}
                        onChange={e => props.handleChange(field.name, e.target.value)}
                    />}
            </div>)}
        </div>

        {props.customer.id && <CustomerHistory history={props.customer.history}/>}

        {props.remove
            ? <div className="customer-view-footer">
                {BottomButtons(props.customer.id === undefined
                    ? props.create
                    : props.update,
                    props.reset,
                    props.disabled,
                    props.customer.id === undefined
                )}
            </div>
            : null}

    </Paper>

}

export default connect(state => state.app.fields)(View);
