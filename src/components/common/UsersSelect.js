import React from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {v4 as uuidv4} from 'uuid';


export default function ({users, user, setUser, onlyValid, disabled, classes, label}) {

    return (<FormControl variant="outlined" className={classes}>
        <InputLabel id="funds-users-control-select-outlined-label">
            {label || "Сотрудник"}
        </InputLabel>
        <Select
            labelId="funds-users-control-select-outlined-label"
            disabled={disabled}
            value={user || 0}
            onChange={e => setUser(e.target.value)}
        >
            <MenuItem key={uuidv4()}
                      value={0}>
                <br/>
            </MenuItem>
            {users.map(u => !onlyValid || u.is_valid
                ? <MenuItem key={uuidv4()}
                            value={u.id}>
                    {u.name}
                </MenuItem>
                : null)}
        </Select>
    </FormControl>)
}