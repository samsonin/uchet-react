import React, from "react";
import {connect} from "react-redux";

import {line} from "../common/InputHandlers";
import {toLocalTimeStr} from "../common/Time";
import {Accordion, AccordionDetails, AccordionSummary, Typography} from "@material-ui/core";
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import uuid from "uuid";

const GoodHistory = props => {


    const provider = props.app.providers.find(v => +v.id === +props.good.provider_id)


    const remselfField = log => {

        const responsible = props.app.users.find(u => u.id === log.user_id)
        const master = props.app.users.find(u => u.id === log.remself.master_id)
        const goods = props.app.users.find(u => u.id === log.remself.goods)

        return <Accordion key={uuid()}>
            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                <Typography style={{width: '30%'}}>
                    Ремонтировали
                </Typography>
                {log.unix &&<Typography>
                    {toLocalTimeStr(log.unix)}
                </Typography>}
            </AccordionSummary>
            <AccordionDetails style={{
                display: 'flex',
                flexDirection: 'column'
            }}>
                {log.remself.defect && line('Работа:', log.remself.defect)}
                {log.remself.sum && line('Сумма:', log.remself.sum)}
                {!!log.remself.cost && line('Себестоимость:', log.remself.cost)}
                {master && line('Мастер:', master.name)}
                {goods && goods.map(g => line(g.barcode, g.model))}
                {responsible && line('Запись вносил:', responsible.name)}
            </AccordionDetails>
        </Accordion>

    }

    const transitField = log => {

        const user = props.app.users.find(u => u.id === log.user_id)
        const stock = props.app.stocks.find(s => s.id === log.stock_id)

        const dir = ['Транзит', stock ? stock.name : '']
        if (log.action === 'to_transit') [dir[0] , dir[1]] = [dir[1] , dir[0]]

        return <Accordion key={uuid()}>
            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                <Typography style={{width: '30%'}}>
                    {dir[0]}
                </Typography>
                <ArrowRightAltIcon style={{width: '30%'}}/>
                <Typography style={{width: '30%'}}>
                    {dir[1]}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <span style={{width: '30%'}}>
                    {user && user.name}
                </span>
                {log.unix && toLocalTimeStr(log.unix)}
            </AccordionDetails>
        </Accordion>

    }

    const editField = log => {

        const user = props.app.users.find(u => u.id === log.user_id)

        console.log(log)

        return <Accordion key={uuid()}>
            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                <Typography style={{width: '30%'}}>
                    Редактирование
                </Typography>
                {log.unix &&<Typography>
                    {toLocalTimeStr(log.unix)}
                </Typography>}
            </AccordionSummary>
            <AccordionDetails style={{
                display: 'flex',
                flexDirection: 'column'
            }}>
                {user && line('Запись вносил:', user.name)}
            </AccordionDetails>
        </Accordion>

    }

    const logRender = log => {

        if (log.remself) return remselfField(log)

        if (log.action && log.action.indexOf('transit') > -1) return transitField(log)

        return editField(log)

    }

    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '.5rem'
    }}>

        {line("Время оприходования:", props.good.unix
            ? toLocalTimeStr(props.good.unix)
            : props.good.time, false)}

        {provider && line('Поставщик:', provider.name, false)}

        {props.good.wf && props.good.wf.consignment_number
            ? line('накладная: ', props.good.wf.consignment_number, false)
            : ''}

        {props.good.log && props.good.log.map(l => logRender(l))}

        {props.good.out_unix && props.good.ui_wo &&
            line('Статус:', props.good.ui_wo + ', c ' + toLocalTimeStr(props.good.out_unix), false)}

    </div>

}
export default connect(state => state)(GoodHistory)