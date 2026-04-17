import React from 'react';

import {Tooltip} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { v4 as uuid } from "uuid";

const mainUrl = document.location.protocol + '//' + document.location.host

export const CustomerLink = props => {

    return <Tooltip title={'Открыть в новом окне'}>
        <IconButton
            onClick={
                () => window.open(mainUrl + '/customers/' + props.id, "_blank")
            }
        >
            <OpenInNewIcon/>
        </IconButton>
    </Tooltip>
}

export const CustomerLine = ({customer}) => <div
    style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid lightgray',
        padding: '0 .5em'
    }}
    key={uuid()}
>
    <div>{customer.fio}</div>
    <CustomerLink id={customer.id}/>
</div>
