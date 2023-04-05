import TextField from "@material-ui/core/TextField";
import React from "react";
import {minDate, today, setInRange} from "./Time";


const DateInterval = props => {


    const textF = (v, f) => <TextField
        type="date"
        inputProps={{min: minDate, max: today}}
        value={v}
        onChange={e => setInRange(f(e.target.value))}
    />

    return <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        margin: '.5rem',
        padding: '.5rem',
    }}>

        <span style={{marginTop: '.4em'}}>{(props.label || '') + ' с '}</span>

        {textF(props.date1, props.setDate1)}

        <span style={{marginTop: '.4em'}}>по</span>

        {textF(props.date2, props.setDate2)}

    </div>


}

export default DateInterval