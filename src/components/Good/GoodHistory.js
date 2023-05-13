import React from "react";
import {connect} from "react-redux";

import {Accordion, AccordionDetails, AccordionSummary, Typography} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import uuid from "uuid";

import TransitField from "./TransitField";
import {lineConst} from "../common/InputHandlers";
import {toLocalTimeStr} from "../common/Time";
import {CustomerLine} from "../customer/CustomerDivs";
import GoodLine from "./GoodLine";


const aliasses = {
    cost: 'Себестоимость',
    sum: 'Сумма',
    defect: 'Работа',
    storage_place: 'Хранение',
    order_id: 'Номер заказа',
}

const GoodHistory = props => {

    const provider = props.app.providers.find(v => +v.id === +props.good.provider_id)

    const acc = (log, unix) => {

        const user = props.app.users.find(u => u.id === log.user_id)
        const stock = props.app.stocks.find(s => s.id === log.stock_id)

        let summaryLabel = 'Редактирование'
        let userLabel = 'Оформлял'

        if (log.customer) summaryLabel = 'Купили у физ. лица'
        if (log.action) {
            if (log.action === 'produce') summaryLabel = 'Чинили'
            if (log.action === 'delGood') summaryLabel = 'Убирали из заказа'
            if (log.action === 'zalog') summaryLabel = 'Закладывали'
        } else if (log.remself || log.remself_id) {
            summaryLabel = 'Чинили'
            userLabel = 'Мастер'
        }

        const details = Object.keys(log)
            .filter(k => !['unix', 'stock_id', 'user_id', 'parts', 'goods'].includes(k))
            .filter(k => !['', 0].includes(log[k]))
            .map(k => {

                if (k === 'public') return lineConst('Статус', log[k] ? 'Опубликован' : 'Не опубликован')

                const f = props.app.fields.allElements.find(e => e.index === 'good' && e.name === k)

                const label = f ? f.value : aliasses[k]

                return !label || lineConst(label, log[k])

            })

        return <Accordion key={uuid()}>
            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                <Typography style={{width: unix ? '50%' : '30%'}}>
                    {summaryLabel}
                </Typography>
                {(log.unix || unix) && <Typography>{toLocalTimeStr(log.unix || unix)}</Typography>}
            </AccordionSummary>
            <AccordionDetails style={{
                display: 'flex',
                flexDirection: 'column'
            }}>

                {log.customer && <CustomerLine customer={log.customer}/>}

                {details}

                {log.goods && log.goods.map(g => <GoodLine model={g.model} barcode={g.barcode}/>)}

                {stock && lineConst('Точка:', stock.name)}
                {user && lineConst((userLabel || 'Оформлял') + ':', user.name)}

            </AccordionDetails>
        </Accordion>
    }

    const wfLabel = props.good.wf
        ? props.good.wf.customer_id
            ? null
            : props.good.wf.action && props.good.wf.action === 'make_good'
                ? 'Изготавливали'
                : 'Время оприходования'
        : null

    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '.5rem'
    }}>

        {!wfLabel || lineConst(wfLabel + ':', props.good.unix
            ? toLocalTimeStr(props.good.unix)
            : props.good.time)}

        {provider && lineConst('Поставщик:', provider.name)}

        {props.good.wf
            ? <>
                {props.good.wf.consignment_number && lineConst('накладная: ', props.good.wf.consignment_number)}
                {props.good.wf.zalog_id && acc(props.good.wf)}
                {!props.good.wf.customer_id || acc(props.good.wf, props.good.unix)}
            </>
            : ''}

        {props.good.log && props.good.log.map(log => log.action && log.action.indexOf('transit') > -1
            ? <TransitField log={log}/>
            : acc(log))}

        {props.good.out_unix && props.good.ui_wo &&
            lineConst('Статус:', props.good.ui_wo + ', c ' + toLocalTimeStr(props.good.out_unix))}

    </div>

}
export default connect(state => state)(GoodHistory)