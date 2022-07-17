import React, {forwardRef, useEffect, useState} from "react";
import StatusesSelect from "../StatusesSelect";
import Button from "@material-ui/core/Button";
import {DialogTitle, FormControl, InputLabel, TextField} from "@material-ui/core";
import {useSnackbar} from "notistack";

import rest from "../../Rest"
import CustomersSelect from "../CustomersSelect";
// import Tree from "../../Tree";
import UsersSelect from "../UsersSelect";
import {intInputHandler, numberInputHandler, sumField} from "../InputHandlers";
import {totalSum} from "./functions";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Slide from "@material-ui/core/Slide";
import uuid from "uuid";

const fieldsStyle = {
    margin: '.4rem',
    width: '100%',
}

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const initSum = 'Предварительная стоимость'
const initPresum = 'Предоплата при оформлении заказа'

export const Info = ({order, app, fields, isAdmin, setOrder, needPrint}) => {

    const {enqueueSnackbar, closeSnackbar} = useSnackbar()

    const [isRest, setIsRest] = useState(false)
    // const [treeOpen, setTreeOpen] = useState(false)

    // const [group_id, setGroup_id] = useState(0)
    const [status_id, setStatus_id] = useState(order ? order.status_id : 0)
    const [category_id, setCategory_id] = useState(order ? order.category_id : 0)
    const [otherCategory, setOtherCategory] = useState('')
    const [customer, setCustomer] = useState(order ? order.customer : {
        id: 0,
        phone_number: '',
        fio: '',
    })
    const [model, setModel] = useState('')
    const [presum, setPresum] = useState(initPresum)
    const [sum, setSum] = useState(order ? order.sum : initSum)
    const [sum2, setSum2] = useState(order ? order.sum : 0)
    const [master_id, setMaster_id] = useState(order ? order.master_id : 0)
    const [for_client, setFor_client] = useState(order ? order.for_client : '')
    const [state, setState] = useState(() => {
        const fl = {}
        fields.map(f => fl[f.name] = '')
        return fl
    })
    const [isReasonOpen, setIsReasonOpen] = useState(false)
    const [reason, setReason] = useState('')

    const setField = (name, value) => {

        setState(prev => {

            const newState = {...prev}
            newState[name] = value || ''
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

    // TODO уточнить в течении смены или нет
    const isToday = time => 0.5 > (new Date() - new Date(time)) / 86400000

    const isWarranty = time => app.config.remont_warranty > (new Date() - new Date(time)) / 86400000

    const isEditable = !isRest && !order || (isAdmin || order.status_id < 6 || isToday(order.checkout_date))

    // const handleTree = category_id => {
    //     setCategory_id(+category_id)
    //     setTreeOpen(false)
    // }

    const afterRest = res => {

        setIsRest(false)
        if (res.status === 200) {

            setOrder(res.body.order)

        } else {

            needPrint.current = false
            enqueueSnackbar('ошибка', {variant: 'error'})

        }

    }

    const create = () => {

        let error = ''

        if (!app.stock_id) error = 'Выберите точку'
        if (!(customer.id || customer.fio || customer.phone_number)) error = 'Нет заказчика'
        if (customer.phone_number && customer.phone_number.length !== 10) error = 'неправильный номер телефона'
        if (!category_id) error = 'Выберите категорию'
        if (category_id === 1000 && !otherCategory) error = 'Впишите другую категорию'
        if (!model) error = 'Не указана модель'

        if (error) return enqueueSnackbar(error, {variant: 'error'})

        const data = {
            customer,
            category_id: category_id === 1000 ? 0 : category_id,
            model: category_id === 1000 ? otherCategory + ' ' + model : model,
            presum,
            sum,
            ...state
        }

        needPrint.current = true

        rest('orders/' + app.stock_id, 'POST', data)
            .then(res => afterRest(res))

    }

    const orderRest = data => {

        setIsRest(true)

        rest('order/' + order.stock_id + '/' + order.id, 'PATCH', data)
            .then(res => afterRest(res))

    }

    const save = () => orderRest({
        customer,
        status_id,
        master_id,
        category_id,
        model,
        sum2,
        for_client,
        ...state
    })

    const checkoutRest = () => {

        needPrint.current = true

        orderRest({
            customer,
            status_id: 6,
            master_id,
            category_id,
            model,
            sum2,
            for_client,
            ...state
        })

    }

    const checkout = () => {

        const payments = totalSum(order)

        if (sum2 !== payments) {

            let message = 'Общая сумма за заказ ' + sum2 + ', оплачено всего ' + payments + ', '

            message += sum2 > payments
                ? 'необходимо доплатить ' + (sum2 - payments)
                : 'необходимо вернуть ' + (payments - sum2)

            const buttonMessage = sum2 > payments
                ? 'Доплатить и закрыть заказ?'
                : 'Вернуть и закрыть заказ?'

            const action = key => (
                <>
                    <Button onClick={() => {
                        closeSnackbar(key)
                        checkoutRest()
                    }}>
                        {buttonMessage}
                    </Button>
                    <Button onClick={() => closeSnackbar(key)}>
                        Отмена
                    </Button>
                </>
            );

            enqueueSnackbar(message, {
                variant: 'warning',
                autoHideDuration: 5000,
                action,
            });

        } else {

            checkoutRest()

        }

    }

    const open = () => {

        setIsRest(true)

        rest('order/' + order.stock_id + '/' + order.id, 'PATCH', {status_id: 0})
            .then(res => {
                setIsRest(false)
                if (res.status !== 200) enqueueSnackbar('ошибка', {variant: 'error'})
            })

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

    const warranty = () => {

        needPrint.current = true

        rest('orders/' + app.stock_id + '/' + order.id + '/warranty', 'POST', {reason})
            .then(res => {
                if (res.status === 200) {
                    setIsReasonOpen(false)
                    setReason('')
                }
                return res
            })
            .then(res => afterRest(res))

    }

    // const category = app.categories.find(c => c.id === category_id)

    const actionButton = (label, onClick) => <Button variant='outlined'
                                                     disabled={isRest}
                                                     className="m-1"
                                                     onClick={onClick}
                                                     color="primary">
        {label}
    </Button>

    let categories = [0, 5, 41, 38]

    return <>

        <Dialog
            open={isReasonOpen}
            TransitionComponent={Transition}
            keepMounted
            onClose={() => setIsReasonOpen(false)}
            className='non-printable'
        >

            <DialogTitle>
                Причина приемки по гарантии
            </DialogTitle>

            <DialogContent>

                <TextField label="Неисправность"
                           style={{width: '100%'}}
                           value={reason}
                           onChange={e => setReason(e.target.value)}
                />

            </DialogContent>

            <DialogActions>
                <Button onClick={() => setIsReasonOpen(false)}
                        color="secondary">
                    Отмена
                </Button>
                <Button onClick={() => warranty()}
                        color="primary">
                    Принять
                </Button>
            </DialogActions>

        </Dialog>


        {order
            ? <>
                {status_id > 5 && order.checkout_date
                    ? <TextField label="Статус"
                                 variant="outlined"
                                 style={fieldsStyle}
                                 disabled={!isEditable}
                                 value={app.statuses.find(s => s.id === order.status_id).name + ' ' + order.checkout_date}
                    />
                    : <StatusesSelect
                        status={status_id}
                        setStatus={setStatus_id}
                        statuses={app.statuses}
                        disabled={!isEditable}
                    />}
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

        {sumField(initSum, sum, setSum, fieldsStyle, isRest || !!order)}

        {order
            ? <TextField label="Итого сумма заказа"
                         disabled={!isEditable}
                         style={fieldsStyle}
                         value={sum2}
                         onChange={e => numberInputHandler(e.target.value, setSum2)}
            />
            : sumField(initPresum, presum, setPresum, fieldsStyle, isRest || !!order)}

        {/*{treeOpen*/}
        {/*    ? <div style={{*/}
        {/*        margin: '1rem'*/}
        {/*    }}>*/}
        {/*        <Tree*/}
        {/*            initialId={category_id}*/}
        {/*            categories={app.categories}*/}
        {/*            onSelected={id => setCategory_id(+id)}*/}
        {/*            finished={id => handleTree(id)}*/}
        {/*        />*/}
        {/*        <Button size="small"*/}
        {/*                onClick={() => setTreeOpen(false)}*/}
        {/*                variant="outlined"*/}
        {/*        >*/}
        {/*            Ок*/}
        {/*        </Button>*/}
        {/*    </div>*/}
        {/*    : isEditable && category && <div style={{*/}
        {/*    margin: '1rem'*/}
        {/*}}>*/}
        {/*    <Button size="small"*/}
        {/*            className="w-100"*/}
        {/*            disabled={!isEditable}*/}
        {/*            onClick={() => setTreeOpen(true)}*/}
        {/*    >*/}
        {/*        {category ? category.name : "Выбрать категорию..."}*/}
        {/*    </Button>*/}
        {/*</div>*/}
        {/*}*/}

        {order
            ? null
            : <FormControl style={fieldsStyle}>

                <InputLabel id="order-info-select-label">
                    Категория
                </InputLabel>

                <Select value={category_id}
                        onChange={e => setCategory_id(e.target.value)}
                        labelId="order-info-select-label"
                >
                    {categories.map(g => {

                        const category = app.categories.find(c => c.id === g)

                        return <MenuItem key={uuid()}
                                         value={g}>
                            {category ? category.name : <br/>}
                        </MenuItem>
                    })}

                    <MenuItem key={uuid()}
                              value={1000}>
                        Другая категория...
                    </MenuItem>

                </Select>

            </FormControl>}

        {category_id === 1000 && <TextField label="Другая категория"
                                            style={fieldsStyle}
                                            value={otherCategory}
                                            onChange={e => setOtherCategory(e.target.value)}
                                            disabled={!isEditable}
        />}

        <TextField label="Модель телефона, планшета, ноутбука или другого устройства"
                   style={fieldsStyle}
                   value={model}
                   onChange={e => setModel(e.target.value)}
                   disabled={!isEditable}
        />

        {fields.map(f => <TextField label={f.value}
                                    key={uuid()}
                                    disabled={!isEditable}
                                    style={fieldsStyle}
                                    value={state[f.name] || ''}
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
                    {isWarranty(order.checkout_date) &&
                        actionButton('Принять по гарантии', () => setIsReasonOpen(true))}
                    {(isAdmin || isToday(order.checkout_date)) && actionButton('Открыть заказ', open)}
                </>
                : <>
                    {actionButton('сохранить', save)}
                    {actionButton('закрыть', checkout)}
                </>
            : actionButton('создать', create)}

    </>
}