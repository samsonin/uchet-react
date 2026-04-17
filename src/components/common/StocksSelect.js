import React from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

export default function ({stocks, stock, setStock, disabled, classes, onlyValid}) {

    return <FormControl variant="outlined" className={classes}>
        <InputLabel id="funds-stocks-control-select-outlined-label">Точка</InputLabel>
        <Select
            labelId="funds-stocks-control-select-outlined-label"
            disabled={disabled}
            value={stock}
            onChange={e => setStock(e.target.value)}
            label="точка"
        >
            <MenuItem key={'menustockscontrolinfundskey0'}
                      value={0}>
                <br/>
            </MenuItem>
            {stocks.filter(st => !onlyValid || st.is_valid)
                .map(st => <MenuItem key={'menustockscontrolinfundskey' + st.id}
                                     value={st.id}>
                    {st.name}
                </MenuItem>)}
        </Select>
    </FormControl>

}