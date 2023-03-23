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
import CategoryHandler from "./common/CategoryHandler";
import {intInputHandler} from "./common/InputHandlers";

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

    const doc = props.app.docs.find(d => d.name === 'real')

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


    const needImei = () => {

        let cid = catId

        while (cid > 4) {

            const showcase = [5, 38, 39, 40, 41, 44]

            if (showcase.includes(cid)) return true

            cid = props.app.categories.find(c => c.id === cid).parent_id

        }

        return false

    }

    const fieldsStyle = {
        margin: '.4rem',
        width: '100%',
    }

    const title = isNew
        ? 'Принять на реализацию'
        : props.current.good.wo
            ? 'Ваплата собственнику'
            : 'Снять с реализации'

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

    let wo

    if (!isNew && props.current.good.wo) {
        wo = props.current.good.ui_wo + ' ' + toLocalTimeStr(props.current.good.out_unix)
    }

    let text = 'Договор реализации'
    if (!isNew) {
        text += ' от ' + toLocalTimeStr(props.current.good.unix)
    }

    const action = () => {

        if (isNew) {

            const data = {
                customer,
                category_id: catId,
                model,
                sum,
                cost
            }

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
            setDialog(props.current.good.wo ? 'checkout' : 'cancel')
        }

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
                {props.current.good.wo ? checkoutText : cancelText}
            </DialogContent>

            <DialogActions>
                <Button onClick={() => setDialog('')}
                        color="secondary">
                    Отмена
                </Button>
                <Button onClick={() => props.current.good.wo ? checkout() : cancel()}
                        color="primary">
                    Ок
                </Button>
            </DialogActions>

        </Dialog>}

        <div style={{
            padding: '0 1rem 0 0',
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

            <CategoryHandler
                id={catId}
                setId={setCatId}
            />

            <TextField label="Наименование"
                       style={fieldsStyle}
                       value={model}
                       onChange={e => isNew ? setModel(e.target.value) : {}}
            />

            {needImei() && <TextField label="Imei или S/N"
                                      style={fieldsStyle}
                                      value={imei}
                                      onChange={e => isNew ? setImei(e.target.value) : {}}
            />}

            <TextField label="Цена для витрины"
                       style={fieldsStyle}
                       value={sum}
                       onChange={e => isNew ? intInputHandler(e.target.value, setSum) : {}}
            />

            <TextField label="Цена комитента"
                       style={fieldsStyle}
                       value={cost}
                       onChange={e => isNew ? intInputHandler(e.target.value, setCost) : {}}
            />

            <TextField label="Примечание"
                       style={fieldsStyle}
                       value={note}
                       onChange={e => isNew ? setNote(e.target.value) : {}}
            />

            {!isNew && props.current.good.wo && <TextField label="Статус"
                                                           style={fieldsStyle}
                                                           value={wo}
            />}

            <div style={{
                padding: '.3rem',
                display: "flex",
                justifyContent: 'space-around'
            }}>
                <Button size="small"
                        color={isNew || props.current.good.wo ? 'primary' : 'secondary'}
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