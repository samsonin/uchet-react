import React, {useState} from "react";

import {useSnackbar} from 'notistack';

import View from '../../components/customer/View'
import rest from "../Rest";

export const Customer = props => {

    const [isRequesting, setRequesting] = useState(false)
    const [serverCustomer, setServerCustomer] = useState({})
    const [customer, setCustomer] = useState({})

    const {enqueueSnackbar} = useSnackbar();

    const initial = customer => {
        setServerCustomer({...customer})
        setCustomer({...customer})
    }

    const create = () => {

        if (isRequesting) return;

        setRequesting(true)
        rest('customers',
            'POST',
            customer
        )
            .then(res => {
                setRequesting(false)
                initial(res.body.customers[0])
            })
    }

    const update = () => {

        if (isRequesting) return;

        setRequesting(true)
        rest('customers/' + customer.id,
            'PUT',
            customer
        )
            .then(res => {
                if (res.ok) {
                    enqueueSnackbar('Сохранено', {
                        variant: 'success',
                    });
                    initial(res.body.customers[0])
                }
                setRequesting(false)
            })
    }

    const reset = () => {
        setCustomer({...serverCustomer})
    }

    const remove = () => {
        
        if (isRequesting) return;
        
        setRequesting(true)
        rest('customers/' + customer.id, 'DELETE')
            .then(res => {
                setRequesting(false)

                if (res.ok) {
                    setCustomer({})
                    enqueueSnackbar('Удалено', {
                        variant: 'success',
                    });
                    props.history.push('/customers')
                } else {
                    enqueueSnackbar('Невозможно удалить', {
                        variant: 'error',
                    });

                }

            })
    }

    const handleChange = (name, value) => {
        let newCustomer = {...customer}
        newCustomer[name] = value
        setCustomer(newCustomer)
    }

    let id = +props.match.params.id;

    if (!isRequesting && id > 0 && customer.id === undefined) {

        setRequesting(true)
        rest('customers/' + id)
            .then(res => {
                if (res.ok) initial(res.body)
                setRequesting(false)
            })
    }

    let isEqual = JSON.stringify(serverCustomer) === JSON.stringify(customer)

    return <View
        customer={customer}
        disabled={isRequesting || isEqual}
        handleChange={handleChange}
        create={create}
        update={update}
        reset={reset}
        remove={remove}
    />

}

