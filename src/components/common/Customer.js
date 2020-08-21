import React, {useState} from "react";

import restRequest from "../Rest";
import View from '../../components/customer/View'


export const Customer = props => {

  const [isRequesting, setRequesting] = useState(false)
  const [serverCustomer, setServerCustomer] = useState({})
  const [customer, setCustomer] = useState({})

  const initial = customer => {
    setServerCustomer({...customer})
    setCustomer({...customer})
  }

  const create = () => {
    setRequesting(true)
    restRequest('customers',
      'POST',
      customer
    )
      .then(res => {
        setRequesting(false)
      })
  }

  const update = () => {
    setRequesting(true)
    restRequest('customers/' + customer.id,
      'PUT',
      customer
    )
      .then(res => {
        if (res.ok) initial(res.body.customers[0])
        setRequesting(false)
      })
  }

  const reset = () => {
    setCustomer({...serverCustomer})
  }

  const handleChange = (name, value) => {
    let newCustomer = {...customer}
    newCustomer[name] = value
    setCustomer(newCustomer)
  }

  let id = +props.match.params.id;

  if (!isRequesting && id > 0 && customer.id === undefined) {

    setRequesting(true)
    restRequest('customers/' + id)
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
  />

}

