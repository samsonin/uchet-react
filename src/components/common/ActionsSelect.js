import React from "react";

import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";


const actions = [
    '',
    'предоплата',
    'продажа',
    'продали',
    'расход',
    'покупка',
    'поступление',
    'вернули',
    'зарплата',
    'в залог',
    'выкупили',
    'другое',
    'возврат'
]

const ActionsSelect = ({action, setAction}) => {

    const handler = action => {

        if (!action) setAction()
        else if (actions.includes(action)) setAction(action)

    }

    return <FormControl
        variant="outlined"
        style={{width: '100%'}}
    >
        <InputLabel id="funds-statuses-control-select-outlined-label">
            Действие
        </InputLabel>
        <Select
            labelId="funds-statuses-control-select-outlined-label"
            value={action || ''}
            onChange={e => handler(e.target.value)}
        >
            {actions.map(a => <MenuItem key={'menu-actions-control-' + a}
                                        value={a}>
                {a || <br/>}
            </MenuItem>)}
        </Select>
    </FormControl>

}

export default ActionsSelect