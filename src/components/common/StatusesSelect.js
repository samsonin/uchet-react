import React from "react";
import {connect} from "react-redux";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

const StatusesSelect = ({status, setStatus, disabled, empty, statuses}) => {
    const items = Array.isArray(statuses) ? statuses : [];

    return <FormControl variant="outlined" className={'w-100 p-1 m-1'}>
        <InputLabel id="funds-statuses-control-select-outlined-label">Статус</InputLabel>
        <Select
            labelId="funds-statuses-control-select-outlined-label"
            disabled={disabled}
            value={status}
            onChange={e => setStatus(e.target.value)}
            label="Статус"
        >
            {empty
                ? <MenuItem key={'menustatusescontrolinfundskey-1'}
                            value={-1}>
                    <br/>
                </MenuItem>
                : null}
            {items.map(s => <MenuItem key={'menustatusescontrolinfundskey' + s.id}
                                      value={s.id}>
                {s.name}
            </MenuItem>)}
        </Select>
    </FormControl>

}

export default connect(state => state.app)(StatusesSelect)
