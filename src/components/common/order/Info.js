import React, {useEffect, useState} from "react";
import StatusesSelect from "../StatusesSelect";
import Button from "@material-ui/core/Button";
import {TextField} from "@material-ui/core";
import {useSnackbar} from "notistack";

import rest from "../../Rest"
import CustomersSelect from "../CustomersSelect";
import Tree from "../../Tree";
import UsersSelect from "../UsersSelect";
import {intInputHandler, numberInputHandler} from "../InputHandlers";

const fieldsStyle = {
    margin: '1rem .3rem',
    width: '100%'
}

export const Info = ({order, app, fields, isAdmin, setOrder, needPrint}) => {

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
    const [sum2, setSum2] = useState(order ? order.sum : 0)
    const [master_id, setMaster_id] = useState(order ? order.master_id : 0)
    const [for_client, setFor_client] = useState(order ? order.for_client : '')
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

    // TODO уточнить в течении смены или нет
    const isToday = time => 0.5 > (new Date() - new Date(time)) / 86400000

    const isWarranty = time => app.config.remont_warranty > (new Date() - new Date(time)) / 86400000

    const isEditable = !isRest && !order || (isAdmin || order.status_id < 6 || isToday(order.checkout_date))

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
                    setOrder(res.body.orders[0])

                }
            })

    }

    const save = () => {

        const data = {
            customer,
            status_id,
            master_id,
            category_id,
            model,
            sum2,
            for_client,
            ...state
        }

        setIsRest(true)

        rest('order/' + order.stock_id + '/' + order.id, 'PATCH', data)
            .then(res => {
                setIsRest(false)
                if (res.status !== 200) enqueueSnackbar('ошибка', {variant: 'error'})
            })

    }

    const warranty = () => {

        console.log('warranty')

    }

    const open = () => {

        console.log('open')

    }

    useEffect(() => {

        if (order) {

            setStatus_id(order.status_id)
            setMaster_id(order.master_id)
            setCustomer(order.customer)
            setCategory_id(order.category_id)
            setModel(order.model)
            setSum(order.sum)
            setSum2(order.sum2)
            setFor_client(order.for_client)

            fields.map(f => {
                setField(f.name, order[f.name])
            })
        }

    }, [order])

    const category = app.categories.find(c => c.id === category_id)

    const actionButton = (label, onClick) => <Button variant='outlined'
                                                     className="m-1"
                                                     onClick={onClick}
                                                     color="primary">
        {label}
    </Button>

    return <>

        {order
            ? <>
                <StatusesSelect
                    status={status_id}
                    setStatus={setStatus_id}
                    statuses={app.statuses}
                    disabled={!isEditable}
                />
                <UsersSelect
                    disabled={!isEditable && (master_id > 0 && !isAdmin)}
                    user={master_id}
                    users={app.users}
                    setUser={setMaster_id}
                    onlyValid
                    classes={"w-100 p-1 m-1"}
                    label="Мастер"
                />
            </>
            : null}

        {customer
            ? <CustomersSelect
                customer={customer}
                updateCustomer={updateCustomer}
                disabled={!!order || !isEditable}
            />
            : null}

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
                <Button size="small"
                        onClick={() => setTreeOpen(false)}
                        variant="outlined"
                >
                    Ок
                </Button>
            </div>
            : isEditable && category && <div style={{
            margin: '1rem'
        }}><Button size="small"
                   className="w-100"
                   disabled={!isEditable}
                   onClick={() => setTreeOpen(true)}
        >
            {category ? category.name : "Выбрать категорию..."}
        </Button>
        </div>
        }

        <TextField label="Модель телефона, планшета, ноутбука или другого устройства"
                   style={fieldsStyle}
                   value={model}
                   onChange={e => setModel(e.target.value)}
                   disabled={!isEditable}
        />

        <TextField label="Предварительная стоимость"
                   disabled={isRest || !!order}
                   style={fieldsStyle}
                   value={sum}
                   onChange={e => intInputHandler(e.target.value, setSum)}
        />

        {order
            ? <TextField label="Итого сумма заказа"
                         disabled={!isEditable}
                         style={fieldsStyle}
                         value={sum2}
                         onChange={e => numberInputHandler(e.target.value, setSum2)}
            />
            : <TextField label="Предоплата при оформлении заказа"
                         disabled={isRest || !!order}
                         style={fieldsStyle}
                         value={presum}
                         onChange={e => intInputHandler(e.target.value, setPresum)}
            />}

        {fields.map(f => <TextField label={f.value}
                                    key={'text-fields-in-new-order' + f.name}
                                    disabled={!isEditable}
                                    style={fieldsStyle}
                                    value={state[f.name]}
                                    onChange={e => setField([f.name], e.target.value)}
        />)}

        {order
            ? <TextField label="В чек для заказчика"
                         disabled={!isEditable}
                         style={fieldsStyle}
                         value={for_client}
                         onChange={e => setFor_client(e.target.value)}
            />
            : null}

        {order
            ? order.status_id === 6
                ? <>
                    {isWarranty(order.checkout_date) && actionButton('Принять по гарантии', warranty)}
                    {(isAdmin || isToday(order.checkout_date)) && actionButton('Открыть заказ', open)}
                </>
                : actionButton('сохранить', save)
            : actionButton('создать', create)}

    </>
}