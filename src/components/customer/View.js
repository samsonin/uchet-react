import React, {useRef, useState} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";

import {
    Button,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from "@mui/icons-material/Delete";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import {useSnackbar} from "notistack";

import {BottomButtons} from "../common/BottomButtons";
import rest from "../Rest";
import {PASSPORT_OCR_PATH} from "../../constants";
import InteractionTableRow from "../common/InteractionTableRow";
import CustomerForm from "./CustomerForm";

const PASSPORT_RECOGNIZING_LABEL = "\u0420\u0430\u0441\u043f\u043e\u0437\u043d\u0430\u0435\u043c...";
const PASSPORT_PHOTO_LABEL = "\u0424\u043e\u0442\u043e \u043f\u0430\u0441\u043f\u043e\u0440\u0442\u0430";
const PASSPORT_RECOGNITION_WARNING = "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0440\u0430\u0441\u043f\u043e\u0437\u043d\u0430\u0442\u044c \u043f\u0430\u0441\u043f\u043e\u0440\u0442\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0444\u043e\u0442\u043e \u0438 \u0437\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u043f\u043e\u043b\u044f \u0432\u0440\u0443\u0447\u043d\u0443\u044e.";
const PASSPORT_RECOGNITION_SUCCESS = "\u041f\u0430\u0441\u043f\u043e\u0440\u0442\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435 \u0440\u0430\u0441\u043f\u043e\u0437\u043d\u0430\u043d\u044b. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0438 \u043f\u0440\u0438 \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e\u0441\u0442\u0438 \u0438\u0441\u043f\u0440\u0430\u0432\u044c\u0442\u0435 \u043f\u043e\u043b\u044f.";
const PASSPORT_RECOGNITION_ERROR = "\u041e\u0448\u0438\u0431\u043a\u0430 \u0440\u0430\u0441\u043f\u043e\u0437\u043d\u0430\u0432\u0430\u043d\u0438\u044f \u043f\u0430\u0441\u043f\u043e\u0440\u0442\u0430. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0435 \u0440\u0430\u0437.";
const CUSTOMER_HISTORY_TITLE = "\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0432\u0437\u0430\u0438\u043c\u043e\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439";
const CUSTOMER_HISTORY_EMPTY = "\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u043f\u043e\u043a\u0430 \u043f\u0443\u0441\u0442\u0430";
const ORDER_HISTORY_LABEL = "\u0417\u0430\u043a\u0430\u0437\u044b";
const PLEDGE_HISTORY_LABEL = "\u0417\u0430\u043b\u043e\u0433\u0438";
const SALE_HISTORY_LABEL = "\u041f\u0440\u043e\u0434\u0430\u0436\u0438";
const BUY_HISTORY_LABEL = "\u041f\u043e\u043a\u0443\u043f\u043a\u0438";
const PREPAID_HISTORY_LABEL = "\u041f\u0440\u0435\u0434\u043e\u043f\u043b\u0430\u0442\u044b";
const UNKNOWN_HISTORY_LABEL = "\u0414\u0440\u0443\u0433\u0438\u0435";
const HISTORY_DATE_LABEL = "\u0414\u0430\u0442\u0430";
const HISTORY_ACTION_LABEL = "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435";
const HISTORY_ORDER_LABEL = "\u0417\u0430\u043a\u0430\u0437";
const HISTORY_ITEM_LABEL = "\u041d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u0435";
const HISTORY_SUM_LABEL = "\u0421\u0443\u043c\u043c\u0430";
const HISTORY_NOTE_LABEL = "\u041f\u0440\u0438\u043c\u0435\u0447\u0430\u043d\u0438\u0435";

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
    const saleMatch = normalizedTable.match(/^sale(\d*)$/);

    if (remMatch) {
        return {
            group: `${ORDER_HISTORY_LABEL}: ${remMatch[1]}`,
            getUrl: id => `/order/${remMatch[1]}/${id}`,
        };
    }

    if (normalizedTable.match(/^zakaz\d*$/) || ["prepaid", "prepaids"].includes(normalizedTable)) {
        return {
            group: PREPAID_HISTORY_LABEL,
            getUrl: id => `/prepaids/${id}`,
        };
    }

    if (["zalog", "pledge", "pledges"].includes(normalizedTable)) {
        return {
            group: PLEDGE_HISTORY_LABEL,
            getUrl: id => `/pledge/${id}`,
        };
    }

    if (saleMatch || normalizedTable === "sales") {
        return {
            group: saleMatch && saleMatch[1] ? `${SALE_HISTORY_LABEL}: ${saleMatch[1]}` : SALE_HISTORY_LABEL,
            getUrl: id => {
                const query = new URLSearchParams({str: id});
                if (saleMatch && saleMatch[1]) query.set("stock_id", saleMatch[1]);
                return `/sales?${query.toString()}`;
            },
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

const parseWorkflow = row => {
    if (!row?.wf) return {};
    if (typeof row.wf === "object") return row.wf;

    try {
        return JSON.parse(row.wf);
    } catch (e) {
        return {};
    }
};

const historyRows = record => {
    if (Array.isArray(record.rows)) return record.rows;

    const ids = Array.isArray(record.id) ? record.id : [record.id].filter(Boolean);
    return ids.map(id => ({id}));
};

const normalizedHistoryTable = record => String(record?.table || "").toLowerCase();

const isPrepaidSaleRow = (record, row) =>
    normalizedHistoryTable(record).match(/^sale\d*$/) && row?.action === "\u043f\u0440\u0435\u0434\u043e\u043f\u043b\u0430\u0442\u0430";

const duplicatedPrepaidOrderIds = records => new Set(records.flatMap(record =>
    historyRows(record)
        .filter(row => isPrepaidSaleRow(record, row))
        .map(row => parseWorkflow(row).zakaz)
        .filter(Boolean)
        .map(String)
));

const shouldSkipDuplicatedHistoryRow = (record, row, prepaidOrderIds) => {
    const table = normalizedHistoryTable(record);

    return (table.match(/^zakaz\d*$/) || ["prepaid", "prepaids"].includes(table))
        && prepaidOrderIds.has(String(row?.id || ""));
};

const historyDate = row => String(row.created_at || row.time || "").slice(0, 16);

const historyValue = (row, valueName) => {
    if (valueName === "date") return historyDate(row);
    if (valueName === "order") return row.id ? `#${row.id}` : "";
    if (valueName === "model") return row.model ?? row.item ?? "";
    if (valueName === "sum") return row.sum ?? row.presum ?? "";
    if (valueName === "note") return row.note ?? row.defect ?? row.for_client ?? row.work ?? "";
    return row[valueName] ?? "";
};

const rowConfig = (record, row) => {
    const config = interactionConfig(record.table);
    const normalizedTable = normalizedHistoryTable(record);
    const wf = parseWorkflow(row);

    if (normalizedTable.match(/^rem\d+$/)) {
        return {
            ...config,
            titles: [HISTORY_ORDER_LABEL, HISTORY_DATE_LABEL, HISTORY_ITEM_LABEL, HISTORY_SUM_LABEL, HISTORY_NOTE_LABEL],
            values: ["order", "date", "model", "sum", "note"],
        };
    }

    if (normalizedTable.match(/^sale\d*$/) && row.action === "\u043f\u0440\u0435\u0434\u043e\u043f\u043b\u0430\u0442\u0430") {
        return {
            ...config,
            group: PREPAID_HISTORY_LABEL,
            titles: [HISTORY_DATE_LABEL, HISTORY_ITEM_LABEL, HISTORY_SUM_LABEL, HISTORY_NOTE_LABEL],
            values: ["date", "item", "sum", "note"],
            getUrl: () => wf.zakaz ? `/prepaids/${wf.zakaz}` : config.getUrl?.(row.id),
        };
    }

    if (normalizedTable.match(/^zakaz\d*$/) || ["prepaid", "prepaids"].includes(normalizedTable)) {
        return {
            ...config,
            titles: [HISTORY_DATE_LABEL, HISTORY_ITEM_LABEL, HISTORY_SUM_LABEL, HISTORY_NOTE_LABEL],
            values: ["date", "item", "sum", "note"],
        };
    }

    if (normalizedTable.match(/^sale\d*$/) || normalizedTable === "sales") {
        return {
            ...config,
            titles: [HISTORY_DATE_LABEL, HISTORY_ACTION_LABEL, HISTORY_ITEM_LABEL, HISTORY_SUM_LABEL, HISTORY_NOTE_LABEL],
            values: ["date", "action", "item", "sum", "note"],
        };
    }

    return {
        ...config,
        titles: [HISTORY_DATE_LABEL, HISTORY_ACTION_LABEL, HISTORY_ITEM_LABEL, HISTORY_SUM_LABEL, HISTORY_NOTE_LABEL],
        values: ["date", "action", "item", "sum", "note"],
    };
};

const CustomerHistory = ({history}) => {
    const records = Array.isArray(history) ? history : [];
    const prepaidOrderIds = duplicatedPrepaidOrderIds(records);
    const visibleRecords = records
        .map(record => ({
            ...record,
            rows: historyRows(record).filter(row => !shouldSkipDuplicatedHistoryRow(record, row, prepaidOrderIds)),
        }))
        .filter(record => record.rows.length);

    return <section className="customer-history">
        <div className="customer-history-title">{CUSTOMER_HISTORY_TITLE}</div>

        {visibleRecords.length
            ? <div className="customer-history-list">
                {visibleRecords.map((record, recordIndex) => {
                    const rows = historyRows(record);
                    const firstRowConfig = rowConfig(record, rows[0] || {});

                    return <div
                        key={`customer-history-${record.table}-${recordIndex}`}
                        className="customer-history-group"
                    >
                        <div className="customer-history-group-title">
                            {firstRowConfig.group}
                            {record.count > rows.length && <span className="customer-history-count"> ({record.count})</span>}
                        </div>
                        <TableContainer component={Paper} className="customer-history-table-wrap">
                            <Table size="small" className="customer-history-table">
                                <TableHead>
                                    <TableRow>
                                        {firstRowConfig.titles.map(title => <TableCell key={`customer-history-title-${record.table}-${title}`}>
                                            {title}
                                        </TableCell>)}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map(row => {
                                        const config = rowConfig(record, row);
                                        const url = config.getUrl ? config.getUrl(row.id) : null;

                                        return <InteractionTableRow
                                            key={`customer-history-row-${record.table}-${row.id}`}
                                            row={row}
                                            values={config.values}
                                            className={url ? "customer-history-row is-clickable" : "customer-history-row"}
                                            onClick={() => openHistoryItem(url)}
                                            getValue={({row, valueName}) => historyValue(row, valueName)}
                                            cellKeyPrefix={`customer-history-cell-${record.table}`}
                                        />
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
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

        <CustomerForm
            customer={props.customer}
            setCustomer={props.setCustomer}
            variant="page"
            showHeader={false}
            showSearch={false}
            lockExistingCustomer={false}
            allowAdditionalContacts
            details={isDetails}
            disabled={false}
        />

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
