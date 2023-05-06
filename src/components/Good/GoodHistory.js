import React from "react";
import {connect} from "react-redux";

import {line} from "../common/InputHandlers";
import {toLocalTimeStr} from "../common/Time";
import {Accordion, AccordionDetails, AccordionSummary, Typography} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import uuid from "uuid";
import {transitField} from "./transitField";


const aliasses = {
    cost: 'Себестоимость',
    sum: 'Сумма',
    defect: 'Неисправность',
    storage_place: 'Хранение',
}

const GoodHistory = props => {


    const provider = props.app.providers.find(v => +v.id === +props.good.provider_id)

    const localTimeString = props.good.unix ? toLocalTimeStr(props.good.unix) : props.good.time

    const editField = log => {

        const user = props.app.users.find(u => u.id === log.user_id)

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
                {Object.keys(log).map(k => {

                    if (['unix', 'user_id'].includes(k)) return ''

                    if (k === 'public') return line('Статус', log[k] ? 'Опубликован' : 'Не опубликован')

                    const f = props.app.fields.allElements.find(e => e.index === 'good' && e.name === k)

                    const label = f ? f.value : aliasses[k]

                    return !label || line(label, log[k])

                })}
                {user && line('Запись вносил:', user.name)}
            </AccordionDetails>
        </Accordion>

    }

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

                {line('Сумма', zalog.sum)}

                {stock && line('Точка:', stock.name)}
                {user && line('Оформлял:', user.name)}

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

                {customer && line('ФИО:', customer.fio)}

                {stock && line('Точка:', stock.name)}

                {!sum || line('Сумма покупки:', sum)}

                {user && line('Оформлял:', user.name)}

            </AccordionDetails>
        </Accordion>

    }


    const AccordInHistory = ({summaryLabel, responsibleLabel, detailContent, user_id, stock_id, unix}) => {

        const user = props.app.users.find(u => u.id === user_id)
        const stock = props.app.stocks.find(s => s.id === stock_id)

        return <Accordion key={uuid()}>
            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                <Typography style={{width: '30%'}}>
                    {summaryLabel}
                </Typography>
                {unix && <Typography>{toLocalTimeStr(unix)}</Typography>}
            </AccordionSummary>
            <AccordionDetails style={{
                display: 'flex',
                flexDirection: 'column'
            }}>
                {detailContent}
                {user && responsibleLabel && line(responsibleLabel, user.name)}
            </AccordionDetails>
        </Accordion>

    }


    const logRender = log => {

        if (log.remself) {

            const master = props.app.users.find(u => u.id === log.remself.master_id)
            const goods = props.app.users.find(u => u.id === log.remself.goods)

            return AccordInHistory({
                summaryLabel: 'Чинили',
                detailContent: <>
                    {log.remself.defect && line('Работа:', log.remself.defect)}
                    {log.remself.sum && line('Сумма:', log.remself.sum)}
                    {!!log.remself.cost && line('Себестоимость:', log.remself.cost)}
                    {master && line('Мастер:', master.name)}
                    {goods && goods.map(g => line(g.barcode, g.model))}
                </>,
                user_id: log.user_id
            })

        }

        if (log.action && log.action.indexOf('transit') > -1) {

            const stock = props.app.stocks.find(s => s.id === log.stock_id)

            const dir = ['Транзит', stock ? stock.name : '']
            if (log.action === 'to_transit') [dir[0], dir[1]] = [dir[1], dir[0]]

            return transitField(log)

        }

        return editField(log)

    }

    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '.5rem'
    }}>

        {/*{!props.good.wf.customer_id && line("Время оприходования:", localTimeString, false)}*/}

        {provider && line('Поставщик:', provider.name)}

        {props.good.wf
            ? <>
                {props.good.wf.consignment_number && line('накладная: ', props.good.wf.consignment_number)}
                {props.good.wf.zalog && zalogField(props.good.wf.zalog)}
                {!props.good.wf.customer_id || customerField(props.good.wf)}
            </>
            : ''}

        {props.good.log && props.good.log.map(l => logRender(l))}

        {props.good.out_unix && props.good.ui_wo &&
            line('Статус:', props.good.ui_wo + ', c ' + toLocalTimeStr(props.good.out_unix))}

    </div>

}
export default connect(state => state)(GoodHistory)