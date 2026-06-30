import React from "react";
import { connect } from "react-redux";

import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import BlockIcon from "@mui/icons-material/Block";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import HandymanIcon from "@mui/icons-material/Handyman";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PrintIcon from "@mui/icons-material/Print";
import HistoryIcon from "@mui/icons-material/History";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

import { useSnackbar } from "notistack";

import rest from "../Rest";
import { PrintBarcodes } from "../common/PrintBarcodes";
import { Print } from "../common/Print";
import store from "../../store";

const GoodActions = props => {
    const { enqueueSnackbar } = useSnackbar();

    const good = props.app.good;
    const doc = props.app.docs.find(d => d.name === "sale_showcase");

    const goodRest = (url, method, success) => {
        if (!good.barcode) throw new Error("нет баркода");

        rest(url + good.barcode, method)
            .then(res => {
                if (res.status === 200) {
                    store.dispatch({ type: "CLOSE_GOOD" });
                    enqueueSnackbar(success, { variant: "success" });
                } else {
                    enqueueSnackbar("ошибка " + res.status, { variant: "error" });
                }
            });
    };

    const transit = isTo => {
        if (!props.app.current_stock_id) {
            return enqueueSnackbar("выберете точку", { variant: "error" });
        }

        goodRest(
            "transit/" + props.app.current_stock_id + "/",
            isTo ? "POST" : "DELETE",
            isTo ? "Передано в транзит" : "Принято из транзита",
        );
    };

    const use = () => goodRest("goods/", "DELETE", "Списано в пользование");
    const restore = () => goodRest("goods/restore/", "PATCH", "Восстановлено");
    const reject = () => goodRest("goods/reject/", "DELETE", "Списано в брак");
    const refund = () => goodRest("goods/refund/", "DELETE", "В кассе");
    const account = () => goodRest("goods/account/", "DELETE", "На счету");

    const passedMilliseconds = Date.now() - (good.unix ? good.unix * 1000 : Date.parse(good.time));
    const canPrintBarcode = props.auth.admin || 12 >= Math.round(passedMilliseconds / 3600000);

    const renderIcon = (tooltip, onClick, icon) => <Tooltip title={tooltip}>
        <IconButton onClick={onClick} aria-label={tooltip} className="good-dialog-icon-button">
            {icon}
        </IconButton>
    </Tooltip>;

    const actions = {
        history: renderIcon("История", () => props.setStatusId(props.statusId ? 0 : 2), <HistoryIcon />),
        transit: renderIcon(good.wo ? "Из транзита" : "В транзит", () => transit(!good.wo), <SwapHorizIcon />),
        reject: renderIcon("В брак", reject, <BlockIcon />),
        restore: renderIcon("Восстановить", restore, <RestoreFromTrashIcon />),
        refund: renderIcon("Вернуть в кассу", refund, <AttachMoneyIcon />),
        accountRefund: renderIcon("Вернуть на счет", account, <ReceiptIcon />),
        repair: renderIcon("Починить", () => props.setStatusId(props.statusId ? 0 : 1), <HandymanIcon />),
        barcode: renderIcon("Штрихкод", () => PrintBarcodes([good.barcode]), <QrCode2Icon />),
        use: renderIcon("В пользование", use, <Inventory2OutlinedIcon />),
        check: renderIcon("Копия чека", () => Print(doc, props.alias), <PrintIcon />),
    };

    return <div className="good-dialog-header">
        <span className="good-dialog-title">
            {"#" + good.id}
            <IconButton
                onClick={() => navigator.clipboard.writeText(good.id)
                    .then(() => enqueueSnackbar("скопировано: " + good.id, { variant: "success" }))}
                aria-label="Скопировать номер"
                className="good-dialog-copy-button"
            >
                <ContentCopyIcon />
            </IconButton>
        </span>

        <div className="good-actions-toolbar">
            {actions.history}
            {props.app.current_stock_id
                ? good.wo === "t"
                    ? actions.transit
                    : props.app.current_stock_id === good.stock_id
                        ? props.statusId === 1
                            ? actions.repair
                            : good.wo
                                ? good.wo.sale_id || good.wo.substring(0, 4) === "sale"
                                    ? actions.check
                                    : good.wo === "use"
                                        ? actions.restore
                                        : good.wo === "reject"
                                            ? <>
                                                {actions.restore}
                                                {actions.refund}
                                                {actions.accountRefund}
                                            </>
                                            : good.wo === "shortage" && props.auth.admin
                                                ? actions.restore
                                                : ""
                                        : <>
                                            {canPrintBarcode && actions.barcode}
                                            {actions.transit}
                                            {actions.reject}
                                            {actions.repair}
                                            {props.auth.admin && actions.use}
                                        </>
                                : ""
                        : ""}
        </div>
    </div>;
};

export default connect(state => state)(GoodActions);
