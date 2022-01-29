import React, {useEffect, useState} from "react";
import StatusesSelect from "../StatusesSelect";
import Button from "@material-ui/core/Button";
import {TextField} from "@material-ui/core";
import {useSnackbar} from "notistack";

import rest from "../../Rest"
import CustomersSelect from "../CustomersSelect";
import Tree from "../../Tree";

const fieldsStyle = {
    margin: '1rem .3rem',
    width: '100%'
}

export const Info = ({order, isEditable, app, fields, isAdmin, setId, needPrint}) => {

    const {enqueueSnackbar} = useSnackbar()

    const [isRest, setIsRest] = useState(false)
    const [treeOpen, setTreeOpen] = useState(false)

    const [status_id, setStatus_id] = useState(order ? order.status_id : 0)
    const [category_id, setCategory_id] = useState(order ? order.category_id : 5)
    const [customer, setCustomer] = useState(order ? order.customer : {
        id: 0,
        phone_number: '',
        fio: '',
    })
    const [model, setModel] = useState('')
    const [presum, setPresum] = useState(0)
    const [sum, setSum] = useState(order ? order.sum : 0)
    const [state, setState] = useState(() => {
        let state = {}
        fields.map(f => {
            state[f.name] = order ? order[f.name] : ''
        })
        return state
    })

    const setField = (name, value) => {

        setState(prev => {

            const newState = {...prev}
            newState[name] = value
            return newState

        })

    }

    const updateCustomer = (name, val) => {

        setCustomer(prev => {

            const newState = {...prev}
            newState[name] = val
            return newState

        })

    }

    const handleTree = category_id => {
        setCategory_id(+category_id)
        setTreeOpen(false)
    }

    const create = () => {

        if (!app.stock_id) return enqueueSnackbar('Выберите точку', {variant: 'error'})
        if (!(customer.id || customer.fio || customer.phone_number)) {
            return enqueueSnackbar('Нет заказчика', {variant: 'error'})
        }
        if (!model) return enqueueSnackbar('Не указана модель', {variant: 'error'})

        const data = {
            customer,
            category_id,
            model,
            presum,
            sum,
            ...state
        }

        rest('orders/' + app.stock_id, 'POST', data)
            .then(res => {

                if (res.status === 200) {

                    needPrint.current = true
                    setId(res.body.orders[0].id)

                }
            })


    }

    const save = () => {

        const data = {
            customer,
            status_id,
            category_id,
            model,
            ...state
        }

        rest('order/' + order.stock_id + '/' + order.id, 'PATCH', data)
            .then(res => {
                setIsRest(false)
                if (res.status !== 200) enqueueSnackbar('ошибка', {variant: 'error'})
            })

    }

    const warranty = () => {

    }

    useEffect(() => {

        if (order) {

            setStatus_id(order.status_id)
            setCustomer(order.customer)
            setCategory_id(order.category_id)
            setModel(order.model)
            setSum(order.sum)

            fields.map(f => {
                setField(f.name, order[f.name])
            })
        }

    }, [order])

    const category = order ? app.categories.find(c => c.id === order.category_id) : 0

    return <>

        {order
            ? <StatusesSelect
                status={status_id}
                setStatus={setStatus_id}
                statuses={app.statuses}
            />
            : null}

        <CustomersSelect
            customer={customer}
            updateCustomer={updateCustomer}
            disabled={!!order}
        />

        {treeOpen
            ? <div style={{
                margin: '1rem'
            }}>
                <Tree
                    initialId={category_id}
                    categories={app.categories}
                    onSelected={id => setCategory_id(+id)}
                    finished={id => handleTree(id)}
                />
                <Button size="small" onClick={() => setTreeOpen(false)}
                        variant="outlined"
                >
                    Ок
                </Button>
            </div>
            : <div style={{
                margin: '1rem'
            }}>
                <Button size="small" className="w-100" onClick={() => setTreeOpen(true)}>
                    {category ? category.name : "Выбрать категорию..."}
                </Button>
            </div>
        }

        <TextField label="Модель телефона, планшета, ноутбука или другого устройства"
                   style={fieldsStyle}
                   value={model}
                   onChange={e => setModel(e.target.value)}
                   disabled={isRest}
        />

        <TextField label="Предварительная стоимость"
                   disabled={isRest || !!order}
                   style={fieldsStyle}
                   value={sum}
                   onChange={e => setSum(+e.target.value)}
        />

        {!order
            ? <TextField label="Предоплата при оформлении заказа"
                         style={fieldsStyle}
                         value={presum}
                         onChange={e => setPresum(+e.target.value)}
            />
            : null}

        {fields.map(f => <TextField label={f.value}
                                    key={'text-fields-in-new-order' + f.name}
                                    disabled={isRest}
                                    style={fieldsStyle}
                                    value={state[f.name]}
                                    onChange={e => setField([f.name], e.target.value)}
        />)}

        {order
            ? <Button variant='outlined'
                      onClick={() => save()}
                      color="primary">
                сохранить
            </Button>
            : <Button variant='outlined'
                      onClick={() => create()}
                      color="primary">
                создать
            </Button>}

        {order && order.status_id === 6 && isAdmin &&
            <Button variant='outlined'
                    onClick={() => setStatus_id(0)}
                    color="primary">
                Открыть заказ
            </Button>}

        {order && order.status_id === 6 &&
            <Button variant='outlined'
                    onClick={() => warranty()}
                    color="primary">
                Принять по гарантии
            </Button>}

    </>
}