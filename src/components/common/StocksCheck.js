import React from "react";
import {connect} from "react-redux";

import {FormControlLabel, Checkbox} from "@material-ui/core";

const StocksCheck = props => {

    const handle = (id, checked) => {

        props.setStocks(prev => {

            if (checked) {

                let nextStocks = [...prev]
                nextStocks.push(id)
                return nextStocks

            } else {

                return prev.filter(s => s !== id)

            }
        })

    }

    return props.app.stocks.map(s => !!s.is_valid && <FormControlLabel
        key={'form-control-in-stocks-check' + s.id}
        control={<Checkbox
            color="primary"
            key={'checkbox-in-stocks-check' + s.id}
            checked={props.stocks.includes(s.id)}
            onChange={e => handle(s.id, e.target.checked)}
        />}
        label={s.name}
    />)

}

export default connect(state => state)(StocksCheck)