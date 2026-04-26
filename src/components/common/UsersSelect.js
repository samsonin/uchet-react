import React from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {v4 as uuidv4} from 'uuid';


export default function ({users, user, setUser, onlyValid, disabled, classes, label}) {

    const visibleUsers = users.filter(u => !onlyValid || u.is_valid)
    const normalizedUser = +(user || 0)

    return (<FormControl variant="outlined" className={`${classes || ""} users-select`}>
        <InputLabel id="funds-users-control-select-outlined-label">
            {label || "Сотрудник"}
        </InputLabel>
        <Select
            labelId="funds-users-control-select-outlined-label"
            disabled={disabled}
            value={normalizedUser}
            onChange={e => setUser(+e.target.value)}
            renderValue={value => visibleUsers.find(u => +u.id === +value)?.name || ""}
        >
            <MenuItem key={uuidv4()}
                      value={0}>
                <br/>
            </MenuItem>
            {visibleUsers.map(u =>
                <MenuItem key={uuidv4()}
                            value={+u.id}>
                    {u.name}
                </MenuItem>
            )}
        </Select>
    </FormControl>)
}
