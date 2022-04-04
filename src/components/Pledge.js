import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import {Button, TextField} from "@material-ui/core";
import {intInputHandler} from "./common/InputHandlers";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import CustomersSelect from "./common/CustomersSelect";


const Pledge = props => {

    const pledge = props.current

    const date = new Date();
    date.setDate(date.getDate() + 1);
    const full = d => d < 10 ? '0' + d : d
    const nextDay = date.getFullYear() + '-' + full(1 + date.getMonth()) + '-' + full(date.getDate())

    const [customer, setCustomer] = useState(pledge.id ? pledge.customer : {
        id: 0,
        phone_number: '',
        fio: '',
    })
    const [model, setModel] = useState(pledge.model ?? '')
    const [imei, setImei] = useState(pledge.imei ?? '')
    const [sum, setSum] = useState(pledge.sum ?? 0)
    const [sum2, setSum2] = useState(pledge.sum2 ?? 0)
    const [ransomdate, setRansomdate] = useState(pledge.ransomdate ?? nextDay)
    const [note, setNote] = useState(pledge.note ?? '')

    const updateCustomer = (name, val) => {

        setCustomer(prev => {

            const newState = {...prev}
            newState[name] = val
            return newState

        })
    }

    const stock = props.app.stocks.find(s => s.id === pledge.stock)
    const timeZone = stock ? stock.timezone_offset : 0

    const isDelay = (Date.now() - Date.parse(pledge.ransomdate)) / 3600000 + timeZone > 24

    const fieldsStyle = {
        margin: '.4rem',
        width: '100%',
    }

    useEffect(() => {

        if (pledge.id && pledge.sum2) return

        const r = Date.parse(ransomdate)
        const n = Date.now()
        const days = Math.ceil((r - n) / 86400000)

        const min = +props.app.config.zalog_min_sum ?? 500
        const percent = +props.app.config.zalog_day_percent ?? 3

        const daily = sum * percent / 100
        const prof = daily * days

        const rs = 50 * Math.round((sum + (min < prof ? prof : min) )/ 50)

        setSum2(rs)

    }, [sum, ransomdate])

    return <div style={{
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

            <IconButton onClick={() => props.setCurrent(false)}>
                <ArrowBackIcon/>
            </IconButton>

            <span style={{
                fontSize: 25, fontWeight: 'bold',
            }}>
        Залог
            </span>

            <span style={{
                fontSize: 25, fontWeight: 'bold',
            }}>
        {pledge.id ? '#' + pledge.id : null}
            </span>

        </div>

        <CustomersSelect
            customer={customer}
            updateCustomer={updateCustomer}
            disabled={pledge.id}
        />

        <TextField label="Наименование"
                   style={fieldsStyle}
                   value={model}
                   onChange={e => pledge.id ? {} : setModel(e.target.value)}
        />

        <TextField label="Imei или S/N"
                   style={fieldsStyle}
                   value={imei}
                   onChange={e => pledge.id ? {} : setImei(e.target.value)}
        />

        {pledge.time && <TextField label="Дата залога"
                                             style={fieldsStyle}
                                             type="date"
                                             value={pledge.time.substring(0, 10)}
        />}

        <TextField label="Сумма залога"
                   style={fieldsStyle}
                   value={sum}
                   onChange={e => pledge.id ? {} : intInputHandler(e.target.value, setSum)}
        />

        <TextField label="Дата выкупа"
                   style={fieldsStyle}
                   type="date"
                   value={ransomdate}
                   error={isDelay}
                   onChange={e => pledge.id ? {} : setRansomdate(e.target.value)}
        />

        <TextField label="Сумма выкупа"
                   style={fieldsStyle}
                   value={sum2}
                   error={isDelay}
                   onChange={e => pledge.id ? {} : intInputHandler(e.target.value, setSum2)}
        />

        <TextField label="Примечание"
                   style={fieldsStyle}
                   value={note}
                   onChange={e => setNote(e.target.value)}
        />

        {props.app.stock_id
            ? pledge.id
                ? pledge.stock === props.app.stock_id
                    ? <div style={{
                        padding: '.3rem',
                        display: "flex",
                        justifyContent: 'space-around'
                    }}>

                        <Button size="small"
                                color="primary"
                                variant="contained"
                                onClick={() => {
                                }}>
                            Сохранить
                        </Button>

                        <Button size="small"
                                color="primary"
                                variant="contained"
                                onClick={() => {
                                }}>
                            Выдать
                        </Button>

                        <Button size="small"
                                color="primary"
                                variant="contained"
                                onClick={() => {
                                }}>
                            На продажу
                        </Button>
                    </div>
                    : null
                : <Button size="small"
                          color="primary"

                          variant="contained"
                          onClick={() => {
                          }}>
                    Принять в залог
                </Button>
            : null}


    </div>


}

export default connect(state => state)(Pledge)