import React from 'react';

import EditIcon from "@material-ui/icons/Edit";
import IconButton from "@material-ui/core/IconButton";
import uuid from "uuid";


const mainUrl = document.location.protocol + '//' + document.location.host

export const CustomerLink = props => {

    return <IconButton
        onClick={
            () => window.open(mainUrl + '/customers/' + props.id, "_blank")
        }
    >
        <EditIcon/>
    </IconButton>

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
