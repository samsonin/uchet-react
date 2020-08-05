import React from 'react';
import TextField from "@material-ui/core/TextField/TextField";

export default function Field(props) {

    return <TextField
        style={{
            width: '100%',
            padding: '1rem',
        }}
        type={props.type}
        label={props.label}
        value={props.value}
        onChange={props.onChange}
    />

}
