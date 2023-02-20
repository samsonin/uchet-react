import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import {Button} from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

import {useSnackbar} from "notistack";

import GoodsTable from "./CostsTable";
import {GoodSearch} from "./GoodSearch";
import rest from "../Rest";
import {intInputHandler, line} from "./InputHandlers";
import UsersSelect from "./UsersSelect";


const AddCosts = props => {

    const [goods, setGoods] = useState([])
    const [sum, setSum] = useState(0)
    const [job, setJob] = useState('')
    const [zp, setZp] = useState(0)
    const [masterId, setMasterId] = useState(0)
    const [cash, setCash] = useState(false)

    const {enqueueSnackbar} = useSnackbar()

    const stock = props.app.stocks.find(s => s.id === props.app.current_stock_id)

    const masterPercent = stock ? stock.master_percent : 0

    let total = 0
    goods.map(g => total += +(g.remcost || g.cost))

    useEffect(() => {

        if (!stock || cash) return

        setZp(Math.round(( sum - total) * masterPercent))

    }, [goods, sum])

    useEffect(() => {

        if (!stock || cash) return

        setSum(total + Math.round(zp / masterPercent))

    }, [zp])

    const repair = () => {

        if (!props.barcode) return enqueueSnackbar('нет кода или S/N', {variant: 'error'})

        const data = {
            sum,
            job,
        }

        if (cash) data.cash = true
        else data.master_id = masterId

        if (goods.length) data.barcodes = goods.map(g => g.barcode)

        rest('goods/repair/' + props.barcode, 'PATCH', data)
            .then(res => {

                if (res.status === 200) {

                    setSum(0)
                    setJob('')
                    setMasterId(0)
                    setGoods([])
                    // props.setIsRepair(false)
                    props.done()

                    enqueueSnackbar('Работа добавлена!', {variant: 'success'})

                    if (res.body.goods) props.setGood(res.body.goods)

                } else {

                    enqueueSnackbar('ошибка ' + res.status, {variant: 'error'})

                }

            })

    }

    const onSelected = (good, afterRes) => {

        setGoods(prev => {

            const next = [...prev]
            next.push(good)
            return next

        })

        afterRes(true)

    }

    const delGood = barcode => setGoods(prev => prev.filter(g => g.barcode !== barcode))

    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        padding: '0 1rem',
    }}>

        {line('Общая стоимость:', sum, true, e => intInputHandler(e.target.value, setSum))}

        {line('Выполненная работа:', job, true, e => setJob(e.target.value))}

        {!!masterId && line('Зарплата', zp, true, e => intInputHandler(e.target.value, setZp))}

        {cash || <UsersSelect
            // classes={classes.field}
            users={props.app.users}
            user={masterId}
            setUser={setMasterId}
            onlyValid={true}
        />}

        {!masterId && <FormControlLabel
            control={<Checkbox checked={cash} onChange={() => setCash(!cash)}/>}
            label="списать с кассы"
        />}

        <Button
            className="m-2"
            variant="outlined"
            onClick={() => repair()}
        >
            Добавить работу
        </Button>

        <GoodsTable goods={goods}
                    delGood={delGood}
                    providers={props.app.providers}
        />

        <GoodSearch onSelected={onSelected}/>


    </div>

}

export default connect(state => state)(AddCosts)