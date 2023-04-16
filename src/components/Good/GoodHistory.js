import React, {useState} from "react";
import {connect} from "react-redux";

import {line} from "../common/InputHandlers";
import {toLocalTimeStr} from "../common/Time";
import {Accordion, AccordionDetails, AccordionSummary, Button, IconButton, Typography} from "@material-ui/core";
import {ExpandLess} from "@material-ui/icons";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import uuid from "uuid";

const GoodHistory = props => {


    const provider = props.app.providers.find(v => +v.id === +props.good.provider_id)


    const remselfField = log => {

        const responsible = props.app.users.find(u => u.id === log.user_id)
        const master = props.app.users.find(u => u.id === log.remself.master_id)
        const goods = props.app.users.find(u => u.id === log.remself.goods)


        return <Accordion key={uuid()}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon/>}
            >
                <Typography>
                    Ремонтировали
                </Typography>
            </AccordionSummary>
            <AccordionDetails style={{
                display: 'flex',
                flexDirection: 'column'
            }}>
                {log.remself.defect && line('Работа:' , log.remself.defect)}
                {log.remself.sum && line('Сумма:' , log.remself.sum)}
                {log.remself.cost && line('Себестоимость:' , log.remself.cost)}
                {master && line('Мастер:' , master.name)}
                {log.remself.unix && line('Время выполнения:' , toLocalTimeStr(log.remself.unix))}
                {goods && goods.map(g => line(g.barcode, g.model))}
                {responsible && line('Запись вносил:' , responsible.name)}
            </AccordionDetails>
        </Accordion>

    }

    const logRender = log => {

        if (log.remself) return remselfField(log)

        const user = props.app.users.find(u => u.id === log.user_id)


        return <div key={uuid()}
                    style={{
                        display: 'flex',
                        padding: '.3rem'
                    }}>
            <span style={{width: '35%'}}>
            {toLocalTimeStr(log.unix)}
        </span>
            <span style={{width: '35%'}}>
            {log.action}
        </span>
            <span style={{width: '30%'}}>
            {user.name}
        </span>
        </div>
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

    </div>

}
export default connect(state => state)(GoodHistory)