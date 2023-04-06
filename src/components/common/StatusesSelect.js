import React from "react";
import {connect} from "react-redux";

import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

const StatusesSelect = ({status, setStatus, disabled, empty, statuses}) => {

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
            {statuses.map(s => <MenuItem key={'menustatusescontrolinfundskey' + s.id}
                                         value={s.id}>
                {s.name}
            </MenuItem>)}
        </Select>
    </FormControl>

}

export default connect(state => state.app)(StatusesSelect)