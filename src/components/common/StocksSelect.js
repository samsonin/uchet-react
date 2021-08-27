import React from "react";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

export default function ({stocks, stock, setStock, disabled, classes}) {

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
                {stocks.map(st => <MenuItem key={'menustockscontrolinfundskey' + st.id}
                                     value={st.id}>
                        {st.name}
                    </MenuItem>)}
            </Select>
        </FormControl>

}