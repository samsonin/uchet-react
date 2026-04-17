import React from "react";

import {Tooltip} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { v4 as uuid } from "uuid";

const mainUrl = document.location.protocol + '//' + document.location.host


const GoodLine = ({model, barcode}) => <div
    style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid lightgray',
        padding: '0 .5em'
    }}
    key={uuid()}
>
    <div>{model}</div>

    <Tooltip title={'Открыть в новом окне'}>
        <IconButton
            onClick={() => window.open(mainUrl + '/goods/' + barcode, "_blank")}
        >
            <OpenInNewIcon/>
        </IconButton>
    </Tooltip>
</div>

export default GoodLine
