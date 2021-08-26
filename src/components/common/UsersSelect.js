import React from "react";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

export default function ({users, user, setUser, onlyValid, disabled, classes}) {

    return <FormControl variant="outlined" className={classes}>
            <InputLabel id="funds-users-control-select-outlined-label">Сотрудник</InputLabel>
            <Select
                labelId="funds-users-control-select-outlined-label"
                disabled={disabled}
                value={user}
                onChange={e => setUser(e.target.value)}
                label="Сотрудник"
            >
                <MenuItem key={'menuuserscontrolinfundskey0'}
                          value={0}>
                    <br/>
                </MenuItem>
                {users.map(u => !onlyValid || u.is_valid
                    ? <MenuItem key={'menuuserscontrolinfundskey' + u.id}
                              value={u.id}>
                        {u.name}
                    </MenuItem>
                    : null)}
            </Select>
        </FormControl>

}