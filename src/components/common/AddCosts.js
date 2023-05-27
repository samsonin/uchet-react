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
import EnteredGood from "../EnteredGood";


const AddCosts = props => {

    const [goods, setGoods] = useState([])
    const [sum, setSum] = useState(0)
    const [job, setJob] = useState('')
    const [zp, setZp] = useState(0)
    const [masterId, setMasterId] = useState(0)
    const [cash, setCash] = useState(false)

    const [model, setModel] = useState('')
    const [category_id, setCategory_id] = useState(0)
    const [imei, setImei] = useState('')

    const {enqueueSnackbar} = useSnackbar()

    const stock = props.app.stocks.find(s => s.id === props.app.current_stock_id)

    const masterPercent = stock ? stock.master_percent : 0

    let total = 0
    goods.map(g => total += +(g.remcost || g.cost))

    useEffect(() => {

        if (!stock || cash) return

        const zp = Math.round((sum - total) * masterPercent)

        intInputHandler(zp, setZp)

    }, [goods])

    const handleSum = sum => {

        const zp = Math.round((sum - total) * masterPercent)

        intInputHandler(sum, setSum)
        intInputHandler(zp, setZp)

    }

    const handleZp = zp => {

        const sum = total + Math.round(zp / masterPercent)

        intInputHandler(sum, setSum)
        intInputHandler(zp, setZp)

    }

    const produce = () => {

        const data = {sum, job}

        if (props.app.current_stock_id) data.stock_id = props.app.current_stock_id

        if (!props.barcode) {

            if (model) data.model = model
            else return enqueueSnackbar('введите наименование')

            if (category_id) data.category_id = category_id
            else return enqueueSnackbar('выберите категорию')

        }

        if (cash) data.cash = true
        else data.master_id = masterId

        if (goods.length) data.barcodes = goods.map(g => g.barcode)

        const url = props.barcode
            ? 'goods/repair/' + props.barcode
            : 'goods/produce'

        rest(url, props.barcode ? 'PATCH' : 'POST', data)
            .then(res => {

                if (res.status === 200) {

                    setSum(0)
                    setJob('')
                    setMasterId(0)
                    setZp(0)
                    setGoods([])
                    setCash(false)
                    setCategory_id(0)
                    setModel('')

                    enqueueSnackbar('ok', {variant: 'success'})

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

        {line('Общая стоимость:', sum, true, e => handleSum(e.target.value))}

        {line('Выполненная работа:', job, true, e => setJob(e.target.value))}

        {!!masterId && line('Зарплата', zp, true, e => handleZp(e.target.value))}

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

        <GoodsTable goods={goods}
                    delGood={delGood}
                    providers={props.app.providers}
        />

        <GoodSearch onSelected={onSelected}/>

        {!props.barcode && <EnteredGood
                category_id={category_id}
                setCategory_id={setCategory_id}
                model={model}
                setModel={setModel}
                imei={imei}
                setImei={setImei}
            />}

        <Button
            style={{margin: '1rem'}}
            variant="outlined"
            onClick={() => produce()}
        >
            {props.button ?? "Добавить работу"}
        </Button>

    </div>

}

export default connect(state => state)(AddCosts)