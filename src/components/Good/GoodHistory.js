import React from "react";
import {connect} from "react-redux";

import {Accordion, AccordionDetails, AccordionSummary, Typography} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import uuid from "uuid";

import TransitField from "./TransitField";
import {lineConst} from "../common/InputHandlers";
import {toLocalTimeStr} from "../common/Time";
import {CustomerLine} from "../customer/CustomerDivs";


const aliasses = {
    cost: 'Себестоимость',
    sum: 'Сумма',
    defect: 'Неисправность',
    storage_place: 'Хранение',
}

const GoodHistory = props => {


    const provider = props.app.providers.find(v => +v.id === +props.good.provider_id)

    const localTimeString = props.good.unix ? toLocalTimeStr(props.good.unix) : props.good.time


    const zalogField = zalog => {

        const user = props.app.users.find(u => u.id === zalog.user_id)
        const stock = props.app.stocks.find(s => s.id === zalog.stock_id)

        return <Accordion key={uuid()}>

            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                <Typography style={{width: '30%'}}>
                    Из залога
                </Typography>
                {zalog.unix && <Typography>
                    {toLocalTimeStr(zalog.unix)}
                </Typography>}
            </AccordionSummary>

            <AccordionDetails style={{
                display: 'flex',
                flexDirection: 'column'
            }}>

                {lineConst('Сумма', zalog.sum)}

                {stock && lineConst('Точка:', stock.name)}
                {user && lineConst('Оформлял:', user.name)}

            </AccordionDetails>
        </Accordion>


    }

    const customerField = ({customer, stock_id, sum, user_id}) => {

        const user = props.app.users.find(u => u.id === user_id)
        const stock = props.app.stocks.find(s => s.id === stock_id)

        return <Accordion key={uuid()}>

            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                <Typography style={{width: '50%'}}>
                    Купили у физ. лица
                </Typography>
                {<Typography>
                    {localTimeString}
                </Typography>}
            </AccordionSummary>

            <AccordionDetails style={{
                display: 'flex',
                flexDirection: 'column'
            }}>

                {customer && <CustomerLine customer={customer} />}

                {stock && lineConst('Точка:', stock.name)}

                {!sum || lineConst('Сумма покупки:', sum)}

                {user && lineConst('Оформлял:', user.name)}

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

        {!wfLabel || lineConst(wfLabel + ':', localTimeString)}

        {provider && lineConst('Поставщик:', provider.name)}

        {props.good.wf
            ? <>
                {props.good.wf.consignment_number && lineConst('накладная: ', props.good.wf.consignment_number)}
                {props.good.wf.zalog && zalogField(props.good.wf.zalog)}
                {!props.good.wf.customer_id || customerField(props.good.wf)}
            </>
            : ''}

        {props.good.log && props.good.log.map(log => {

            const user = props.app.users.find(u => u.id === log.user_id)

            if (log.remself) {

                const master = props.app.users.find(u => u.id === log.remself.master_id)
                const goods = props.app.users.find(u => u.id === log.remself.goods)

                return <Accordion key={uuid()}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <Typography style={{width: '30%'}}>
                            Чинили
                        </Typography>
                        {log.unix && <Typography>{toLocalTimeStr(log.unix)}</Typography>}
                    </AccordionSummary>
                    <AccordionDetails style={{
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {log.remself.defect && lineConst('Работа:', log.remself.defect)}
                        {log.remself.sum && lineConst('Сумма:', log.remself.sum)}
                        {!!log.remself.cost && lineConst('Себестоимость:', log.remself.cost)}
                        {master && lineConst('Мастер:', master.name)}
                        {goods && goods.map(g => lineConst(g.barcode, g.model))}
                        {user && lineConst('Запись вносил:', user.name)}
                    </AccordionDetails>
                </Accordion>

            }

            if (log.action && log.action.indexOf('transit') > -1) return <TransitField log={log}/>

            if (log.action && log.action === 'delGood') return <Accordion key={uuid()}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                    <Typography style={{width: '30%'}}>
                        Убирали из заказа
                    </Typography>
                    {log.unix && <Typography>
                        {toLocalTimeStr(log.unix)}
                    </Typography>}
                </AccordionSummary>
                <AccordionDetails style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {lineConst('Номер заказа:', log.order_id)}
                    {user && lineConst('Запись вносил:', user.name)}
                </AccordionDetails>
            </Accordion>

            const details = Object.keys(log)
                .filter(k => !['unix', 'user_id', 'parts'].includes(k))
                .map(k => {

                    if (k === 'public') return lineConst('Статус', log[k] ? 'Опубликован' : 'Не опубликован')

                    const f = props.app.fields.allElements.find(e => e.index === 'good' && e.name === k)

                    const label = f ? f.value : aliasses[k]

                    return !label || lineConst(label, log[k])

                })

            return <Accordion key={uuid()}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                    <Typography style={{width: '30%'}}>
                        Редактирование
                    </Typography>
                    {log.unix && <Typography>
                        {toLocalTimeStr(log.unix)}
                    </Typography>}
                </AccordionSummary>
                <AccordionDetails style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {details}
                    {user && lineConst('Запись вносил:', user.name)}
                </AccordionDetails>
            </Accordion>


        })}

        {props.good.out_unix && props.good.ui_wo &&
            lineConst('Статус:', props.good.ui_wo + ', c ' + toLocalTimeStr(props.good.out_unix))}

    </div>

}
export default connect(state => state)(GoodHistory)