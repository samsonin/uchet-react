import React from "react";
import {connect} from "react-redux";

import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import RestoreFromTrashIcon from "@material-ui/icons/RestoreFromTrash";
import BuildIcon from "@material-ui/icons/Build";
import LineWeightIcon from "@material-ui/icons/LineWeight";
import DeleteIcon from "@material-ui/icons/Delete";
import PrintIcon from "@material-ui/icons/Print";
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import HistoryIcon from '@material-ui/icons/History';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import ReceiptIcon from '@material-ui/icons/Receipt';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import {useSnackbar} from "notistack";

import rest from "../Rest";
import {PrintBarcodes} from "../common/PrintBarcodes";
import {Print} from "../common/Print";
import store from "../../store";


const GoodActions = props => {

    const {enqueueSnackbar} = useSnackbar()

    const good = props.app.good

    const doc = props.app.docs.find(d => d.name === 'sale_showcase')

    const goodRest = (url, method, success) => {

        if (!good.barcode) throw new Error('нет баркода')

        rest(url + good.barcode, method)
            .then(res => {

                if (res.status === 200) {

                    store.dispatch({type: 'CLOSE_GOOD'})

                    enqueueSnackbar(success, {variant: 'success'})

                } else {

                    enqueueSnackbar('ошибка ' + res.status, {variant: 'error'})

                }
            })
    }

    const transit = isTo => {

        if (!props.app.current_stock_id) return enqueueSnackbar('выберете точку', {variant: 'error'})

        goodRest('transit/' + props.app.current_stock_id + '/',
            isTo ? 'POST' : 'DELETE',
            isTo ? 'Передано в транзит' : 'Принято из транзита')
    }

    const use = () => goodRest('goods/', 'DELETE', 'Списано в пользование')

    const restore = () => goodRest('goods/restore/', 'PATCH', 'Восстановлено')

    const reject = () => goodRest('goods/reject/', 'DELETE', 'Списано в брак')

    // зачислить деньги в кассу
    const refund = () => goodRest('goods/refund/', 'DELETE', 'В кассе')

    const account = () => goodRest('goods/account/', 'DELETE', 'На счету')

    const passedMilliseconds = Date.now() - (good.unix ? good.unix * 1000 : Date.parse(good.time))
    const canPrintBarcode = props.auth.admin || 12 >= Math.round(passedMilliseconds / 3600000)
    const renderIcon = (tooltip, onClick, elem) => <Tooltip title={tooltip}>
        <IconButton onClick={onClick}>
            {elem}
        </IconButton>
    </Tooltip>

    // TODO найти нормальные иконки

    const actions = {
        history: renderIcon('История', () => props.setStatusId(props.statusId ? 0 : 2), <HistoryIcon/>),
        open: renderIcon('открыть в отдельной вкладке', () => props.open(), <AspectRatioIcon/>),
        transit: renderIcon(good.wo ? 'Из транзита' : 'В транзит',
            () => transit(!good.wo),
            <i className="fas fa-truck"/>),
        reject: renderIcon('В брак', () => reject(), <ThumbDownIcon/>),
        restore: renderIcon("Восстановить", () => restore(), <RestoreFromTrashIcon/>),
        refund: renderIcon('Вернуть в кассу', refund, <AttachMoneyIcon/>),
        accountRefund: renderIcon('Вернуть на счет', account, <ReceiptIcon/>),
        repair: renderIcon('Починить', () => props.setStatusId(props.statusId ? 0 : 1), <BuildIcon/>),
        barcode: renderIcon('Штрихкод', () => PrintBarcodes([good.barcode]), <LineWeightIcon/>),
        use: renderIcon("В пользование", () => use(), <DeleteIcon/>),
        check: renderIcon("Копия чека", () => Print(doc, props.alias), <PrintIcon/>),
    }


    const renderDiv = <div>
        {actions.history}
        {props.app.current_stock_id
            ? good.wo === 't'
                ? actions.transit
                : props.app.current_stock_id === good.stock_id
                    ? props.statusId === 1
                        ? actions.repair
                        : good.wo
                            ? good.wo.sale_id || good.wo.substring(0, 4) === 'sale'
                                ? actions.check
                                : good.wo === 'use'
                                    ? actions.restore
                                    : good.wo === 'reject'
                                        ? <>
                                            {actions.restore}
                                            {actions.refund}
                                            {actions.accountRefund}
                                        </>
                                        : good.wo === 'shortage' && props.auth.admin
                                            ? actions.restore
                                            : ''
                            : <>
                                {canPrintBarcode && actions.barcode}
                                {actions.transit}
                                {actions.reject}
                                {actions.repair}
                                {props.auth.admin && actions.use}
                            </>
                    : ''
            : ''
        }
    </div>


    return <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginRight: '2rem',
    }}>

        <span style={{fontWeight: 'bold'}}>

                {'#' + good.id}

            <IconButton onClick={() => navigator.clipboard.writeText(good.id)
                .then(() => enqueueSnackbar('скопировано: ' + good.id, {variant: 'success'}))
            }>
                <FileCopyIcon/>
            </IconButton>

        </span>

        {renderDiv}

    </div>

}
export default connect(state => state)(GoodActions)