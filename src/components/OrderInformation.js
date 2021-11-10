import TextField from "@material-ui/core/TextField/TextField";
import CustomersSelect from "./common/CustomersSelect";
import React, {useState} from "react";
import {connect} from "react-redux";

const initCustomer = {
    id: 0,
    phone_number: '',
    fio: '',
}

const fieldsStyle = {
    margin: '1rem .3rem',
    width: '100%'
}

// export default function ({id, stock_id, preValues}) {

const OrderInformation = props => {

    const [customer, setCustomer] = useState(initCustomer)
    const [model, setModel] = useState('')
    const [sum, setSum] = useState(0)
    const [sum2, setSum2] = useState(0)
    const [state, setState] = useState({})

    const setField = (name, value) => {

        setState(prev => {

            const newState = {...prev}
            newState[name] = value
            return newState

        })

    }

    const disabled = props.id && props.stock_id

    const updateCustomer = (name, val) => {

        setCustomer(prev => {

            const newState = {...prev}
            newState[name] = val
            return newState

        })

    }

    // useEffect(() => {
    //
    // }, [])

    return <>
        <CustomersSelect
            customer={customer}
            disabled={disabled}
            updateCustomer={updateCustomer}
        />

        <TextField label="Наименование"
                   style={fieldsStyle}
                   value={model}
                   onChange={e => setModel(e.target.value)}
        />

        <TextField label="Предоплата"
                   disabled={disabled}
                   style={fieldsStyle}
                   value={sum}
                   onChange={e => setSum(+e.target.value)}
        />

        <TextField label="Окончательная стоимость"
                   disabled={disabled}
                   style={fieldsStyle}
                   value={sum2}
                   onChange={e => setSum2(+e.target.value)}
        />

        {props.app.fields.allElements
            .filter(f => f.index === 'order' && f.is_valid && !f.is_system)
            .map(f => <TextField label={f.value}
                                  key={'textfieldsinneworder' + f.name}
                                  disabled={disabled}
                                  style={fieldsStyle}
                                  value={state[f.name]}
                                  onChange={e => setField([f.name], e.target.value)}
                />)}

    </>
}

export default connect(state => state)(OrderInformation)