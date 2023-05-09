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

import {useSnackbar} from "notistack";

import rest from "../Rest";
import {PrintBarcodes} from "../common/PrintBarcodes";
import {Print} from "../common/Print";


const GoodActions = props => {

    const {enqueueSnackbar} = useSnackbar()

    const doc = props.app.docs.find(d => d.name === 'sale_showcase')

    const goodRest = (url, method, success) => {

        if (!props.good.barcode) throw new Error('нет баркода')

        rest(url + props.good.barcode, method)
            .then(res => {

                if (res.status === 200) {

                    // if (url.substring(0, 7) === 'transit' && method === 'POST') {
                    //     if (typeof (props.hide) === "function") props.hide(props.good.id)
                    // }

                    if (props.close) props.close()

                    enqueueSnackbar(success, {variant: 'success'})

                    if (res.body.goods) props.setGood(res.body.goods)
                    if (res.body.good) props.setGood(res.body.good)

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

    const restore = () => goodRest('goods/restore/', 'POST', 'Восстановлено')

    const reject = () => goodRest('goods/reject/', 'DELETE', 'Списано в брак')

    // зачислить деньги в кассу
    const refund = () => goodRest('goods/refund/', 'DELETE', 'Списано в брак')

    const account = () => goodRest('goods/account/', 'DELETE', 'Списано в брак')

    const passedMilliseconds = Date.now() - (props.good.unix ? props.good.unix * 1000 : Date.parse(props.good.time))
    const canPrintBarcode = props.auth.admin || 12 >= Math.round(passedMilliseconds / 3600000)
    const renderIcon = (tooltip, onClick, elem) => <Tooltip title={tooltip}>
        <IconButton onClick={onClick}>
            {elem}
        </IconButton>
    </Tooltip>

    const actions = {
        history: renderIcon('История', () => props.setIsHistory(!props.isHistory), <HistoryIcon/>),
        open: renderIcon('открыть в отдельной вкладке', () => props.open(), <AspectRatioIcon/>),
        transit: renderIcon(props.good.wo ? 'Из транзита' : 'В транзит',
            () => transit(!props.good.wo),
            <i className="fas fa-truck"/>),
        reject: renderIcon('В брак', () => reject(), <ThumbDownIcon/>),
        restore: renderIcon("Восстановить", () => restore(), <RestoreFromTrashIcon/>),
        refund: renderIcon('Вернуть в кассу', refund, <i className="fas fa-truck"/>),
        accountRefund: renderIcon('Вернуть на счет', account, <i className="fas fa-truck"/>),
        repair: renderIcon('Починить', () => props.setIsRepair(!props.isRepair), <BuildIcon/>),
        barcode: renderIcon('Штрихкод', () => PrintBarcodes([props.good.barcode]), <LineWeightIcon/>),
        use: renderIcon("В пользование", () => use(), <DeleteIcon/>),
        check: renderIcon("Копия чека", () => Print(doc, props.alias), <PrintIcon/>),
    }


    const renderDiv = <div>
        {actions.history}
        {props.app.current_stock_id
            ? props.good.wo === 't'
                ? actions.transit
                : props.app.current_stock_id === props.good.stock_id
                    ? props.isRepair
                        ? actions.repair
                        : props.good.wo
                            ? props.good.wo.indexOf('sale') > -1
                                ? actions.check
                                : props.good.wo === 'use'
                                    ? actions.restore
                                    : props.good.wo === 'reject'
                                        ? <>
                                            {actions.restore}
                                            {actions.refund}
                                            {actions.accountRefund}
                                        </>
                                        : props.good.wo === 'shortage' && props.auth.admin
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
                    {'#' + props.good.id}
        </span>

        {renderDiv}

    </div>

}
export default connect(state => state)(GoodActions)