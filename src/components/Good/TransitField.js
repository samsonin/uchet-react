import React from "react";
import {connect} from "react-redux";

import {Accordion, AccordionDetails, AccordionSummary, Typography} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import { v4 as uuid } from "uuid";

import {toLocalTimeStr} from "../common/Time";

const TransitField = props => {

    const {log, users, stocks} = props
    const user = users.find(u => u.id === log.user_id)
    const stock = stocks.find(s => s.id === log.stock_id)

    const dir = ['Транзит', stock ? stock.name : '']
    if (log.action === 'to_transit') [dir[0], dir[1]] = [dir[1], dir[0]]

    return <Accordion key={uuid()} className="good-history-accordion">
        <AccordionSummary expandIcon={<ExpandMoreIcon/>} className="good-history-summary">
            <Typography className="good-history-summary-label">
                {dir[0]}
            </Typography>
            <ArrowRightAltIcon className="good-history-transit-icon"/>
            <Typography className="good-history-summary-label">
                {dir[1]}
            </Typography>
        </AccordionSummary>
        <AccordionDetails className="good-history-transit-details">
                <span className="good-history-transit-user">
                    {user && user.name}
                </span>
            {log.unix && toLocalTimeStr(log.unix)}
        </AccordionDetails>
    </Accordion>

}

export default connect(state => state.app)(TransitField)
