import React, {forwardRef, useState} from "react";
import Fields from "./customer/Fields";
import {connect} from "react-redux";
import {Button, Dialog, DialogContent, DialogTitle, TextField} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import {Print} from "./common/Print";
import PrintIcon from "@material-ui/icons/Print";
import {toLocalTimeStr} from "./common/Time";
import Slide from "@material-ui/core/Slide";
import DialogActions from "@material-ui/core/DialogActions";

import rest from "./Rest"

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
})

const checkoutText = 'Деньги будут списаны из кассы, их необходимо будет отдать собственнику и взять у него расписку о получении денежных средств'
const cancelText = 'Договор реализации будет анулирован, необходимо вернуть товар собственнику и взять у него расписку о получении товара'

const Real = props => {

    const [customer, setCustomer] = useState(props.current.customer ? props.current.customer : {})
    const [dialog, setDialog] = useState('')

    const [model, setModel] = useState(props.current.good ? props.current.good.model : '')
    const [cost, setCost] = useState(0)
    const [sum, setSum] = useState(0)

    const fieldsStyle = {
        margin: '.4rem',
        width: '100%',
    }

    const title = props.current.good
        ? props.current.good.wo
            ? 'Ваплата собственнику'
            : 'Снять с реализации'
        : 'Принять на реализацию'


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

    if (props.current.good && props.current.good.wo) {
        wo = props.current.good.ui_wo + ' ' + toLocalTimeStr(props.current.good.out_unix)
    }

    let text = 'Договор реализации'
    if (props.current.good) {
        text +=' от ' + toLocalTimeStr(props.current.good.unix)
    }

    return <>

        {props.current.good && <Dialog
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
                    // onClick={() => Print(doc, alias)}
                >
                    <PrintIcon/>
                </IconButton>

            </div>

            <Fields
                customer={customer}
                setCustomer={setCustomer}
            />

            <TextField label="Наименование"
                       style={fieldsStyle}
                       value={model}
                       onChange={e => props.current ? {} : setModel(e.target.value)}
            />

            <TextField label="Imei или S/N"
                       style={fieldsStyle}
                       value={props.current.good.imei}
            />

            <TextField label="Цена для витрины"
                       style={fieldsStyle}
                       value={props.current.sum}
            />

            <TextField label="Цена комитента"
                       style={fieldsStyle}
                       value={props.current.cost}
            />

            {props.current.note && <TextField label="Примечание"
                                              style={fieldsStyle}
                                              value={props.current.note}
            />}

            {props.current.good.wo && <TextField label="Статус"
                                                 style={fieldsStyle}
                                                 value={wo}
            />}

            <div style={{
                padding: '.3rem',
                display: "flex",
                justifyContent: 'space-around'
            }}>

                <Button size="small"
                        color={props.current.good.wo ? 'primary' : 'secondary'}
                        variant="contained"
                        onClick={() => setDialog(props.current.good.wo ? 'checkout' : 'cancel')}
                >
                    {title}
                </Button>

            </div>

        </div>
    </>
}

export default connect(state => state)(Real)