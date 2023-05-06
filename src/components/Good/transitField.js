import React from "react";

import {Accordion, AccordionDetails, AccordionSummary, Typography} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ArrowRightAltIcon from "@material-ui/icons/ArrowRightAlt";
import uuid from "uuid";

import {toLocalTimeStr} from "../common/Time";

export const transitField = log => {

    const user = props.app.users.find(u => u.id === log.user_id)
    const stock = props.app.stocks.find(s => s.id === log.stock_id)

    const dir = ['Транзит', stock ? stock.name : '']
    if (log.action === 'to_transit') [dir[0], dir[1]] = [dir[1], dir[0]]

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
