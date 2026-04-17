import React, {useEffect, useMemo} from "react";
import {connect} from "react-redux";

import {FormControlLabel, Checkbox} from "@material-ui/core";

const StocksCheck = props => {

    const {stocks, setStocks, disabled} = props
    const validStocks = useMemo(() => props.app.stocks.filter(s => !!s.is_valid), [props.app.stocks])

    useEffect(() => {
        if (validStocks.length === 1 && !stocks.includes(validStocks[0].id)) {
            setStocks([validStocks[0].id])
        }
    }, [setStocks, stocks, validStocks])

    const handle = (id, checked) => {

        setStocks(prev => {

            if (checked) {

                let nextStocks = [...prev]
                nextStocks.push(id)
                return nextStocks

            } else {

                return prev.filter(s => s !== id)

            }
        })

    }

    if (validStocks.length <= 1) return null

    return validStocks.map(s => <FormControlLabel
        key={'form-control-in-stocks-check' + s.id}
        control={<Checkbox
            color="primary"
            key={'checkbox-in-stocks-check' + s.id}
            checked={stocks.includes(s.id)}
            disabled={disabled}
            onChange={e => handle(s.id, e.target.checked)}
        />}
        label={s.name}
    />)

}

export default connect(state => state)(StocksCheck)
