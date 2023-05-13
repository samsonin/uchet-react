import React from "react";

import {Tooltip} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import uuid from "uuid";

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