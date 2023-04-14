import React, {forwardRef, useState} from "react";
import Fields from "./customer/Fields";
import {connect} from "react-redux";
import {Button, Dialog, DialogContent, DialogTitle, TextField} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import {createDate, Print} from "./common/Print";
import PrintIcon from "@material-ui/icons/Print";
import {toLocalTimeStr} from "./common/Time";
import Slide from "@material-ui/core/Slide";
import DialogActions from "@material-ui/core/DialogActions";

import rest from "./Rest"
import {intInputHandler, line} from "./common/InputHandlers";
import {useSnackbar} from "notistack";
import EnteredGood from "./EnteredGood";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
})

const checkoutText = 'Деньги будут списаны из кассы, их необходимо будет отдать собственнику и взять у него расписку о получении денежных средств'
const cancelText = 'Договор реализации будет анулирован, необходимо вернуть товар собственнику и взять у него расписку о получении товара'

const Real = props => {

    const isNew = !props.current.good

    const [customer, setCustomer] = useState(isNew ? {} : props.current.customer)
    const [dialog, setDialog] = useState('')

    const [catId, setCatId] = useState(isNew ? 0 : props.current.good.category_id)
    const [model, setModel] = useState(isNew ? '' : props.current.good.model)
    const [imei, setImei] = useState(isNew ? '' : props.current.good.imei)
    const [cost, setCost] = useState(isNew ? 0 : props.current.good.cost)
    const [sum, setSum] = useState(isNew ? 0 : props.current.good.sum)
    const [note, setNote] = useState(isNew ? '' : props.current.note)

    const {enqueueSnackbar} = useSnackbar()

    const doc = props.app.docs.find(d => d.name === 'real')

    const isSame = !isNew
        && catId === props.current.good.category_id
        && model === props.current.good.model
        && imei === props.current.good.imei
        && cost === props.current.good.cost
        && sum === props.current.good.sum
        && note === props.current.good.note

    const isWo = !isNew && !!props.current.good.wo

    const alias = {
        today: createDate(isNew ? '' : props.current.good.unix * 1000),
        organization_organization: props.app.organization.organization,
        organization_inn: props.app.organization.inn,
        fio: customer.fio,
        phone_number: customer.phone_number,
        birthday: customer.birthday ? createDate(customer.birthday) : '',
        doc_sn: customer.doc_sn,
        doc_date: customer.doc_date ? createDate(customer.doc_date) : '',
        doc_division_name: customer.doc_division_name,
        address: customer.address,
        imei,
        model,
        cost,
        remark: note
    }


    const fieldsStyle = {
        margin: '.4rem',
        width: '100%',
    }

    const title = isNew
        ? 'Принять на реализацию'
        : isWo
            ? 'Ваплата собственнику'
            : isSame
                ? 'Снять с реализации'
                : 'Сохранить'

    const afterRes = res => {

        if (res.status < 205) {

            setDialog('')
            props.del(props.current.id)

        }

    }

    const checkout = () => rest('real/' + props.current.id, 'PATCH')
        .then(res => afterRes(res))

    const cancel = () => rest('real/' + props.current.id, 'DELETE')
        .then(res => afterRes(res))

    let ui_wo

    if (!isNew && isWo) {
        ui_wo = props.current.good.ui_wo + ' ' + toLocalTimeStr(props.current.good.out_unix)
    }

    let text = 'Договор реализации'
    if (!isNew) {
        text += ' от ' + toLocalTimeStr(props.current.good.unix)
    }

    const action = () => {

        if (isNew) {

            let errorText
            if (!customer.fio) errorText = 'ФИО'
            else if (!catId) errorText = 'категорию'
            else if (!model) errorText = 'наимменование'
            else if (!sum) errorText = 'цену для витрины'
            else if (!cost) errorText = 'цену комитента'

            const data = {
                customer,
                category_id: catId,
                model,
                sum,
                cost
            }

            if (errorText) return enqueueSnackbar('введите ' + errorText, {variant: 'error'})

            if (imei) data.imei = imei
            if (props.app.current_stock_id) data.stock_id = props.app.current_stock_id

            rest('real', 'Post', data)
                .then(res => {

                    if (res.status === 200) {
                        Print(doc, alias)
                        if (res.body.real) props.add(res.body.real)
                    }

                })

        } else {
            setDialog(isWo ? 'checkout' : 'cancel')
        }

    }

    const handler = (value, setFunction) => {

        if (isNew) intInputHandler(value, setFunction)

    }

    return <>

        {isNew || <Dialog
            open={dialog !== ''}
            TransitionComponent={Transition}
            keepMounted
            onClose={() => setDialog('')}
        >

            <DialogTitle>
                {title}
            </DialogTitle>

            <DialogContent>
                {isWo ? checkoutText : cancelText}
            </DialogContent>

            <DialogActions>
                <Button onClick={() => setDialog('')}
                        color="secondary">
                    Отмена
                </Button>
                <Button onClick={() => isWo ? checkout() : cancel()}
                        color="primary">
                    Ок
                </Button>
            </DialogActions>

        </Dialog>}

        <div style={{
            padding: '.5rem',
            background: '#fff',
            borderRadius: 3
        }}>

            <div style={{
                margin: '.1rem',
                padding: '.1rem',
                display: "flex",
                justifyContent: 'space-between',
            }}>

                <IconButton onClick={() => props.setCurrent()}>
                    <ArrowBackIcon/>
                </IconButton>

                <span style={{
                    fontSize: 20, fontWeight: 'bold',
                }}>
                    {text}
            </span>

                <IconButton
                    onClick={() => Print(doc, alias)}
                >
                    <PrintIcon/>
                </IconButton>

            </div>

            <Fields
                customer={customer}
                setCustomer={setCustomer}
            />

            <EnteredGood
                category_id={catId}
                setCategory_id={setCatId}
                model={model}
                setModel={setModel}
                imei={imei}
                setImei={setImei}
            />

            {line('Цена для витрины:', sum, !isWo, e => handler(e.target.value, setSum))}

            {line('Цена комитента:', cost, !isWo, e => handler(e.target.value, setCost))}

            <TextField label="Примечание"
                       style={fieldsStyle}
                       value={note}
                       onChange={e => isNew ? setNote(e.target.value) : {}}
            />

            {!isNew && isWo && <TextField label="Статус"
                                          style={fieldsStyle}
                                          value={ui_wo}
            />}

            <div style={{
                padding: '.3rem',
                display: "flex",
                justifyContent: 'space-around'
            }}>
                <Button size="small"
                        color={isNew || isWo ? 'primary' : 'secondary'}
                        variant="contained"
                        onClick={() => action()}
                >
                    {title}
                </Button>

            </div>

        </div>
    </>
}

export default connect(state => state)(Real)