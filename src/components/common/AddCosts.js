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
import Tree from "../../components/Tree"


const AddCosts = props => {

    const [goods, setGoods] = useState([])
    const [sum, setSum] = useState(0)
    const [job, setJob] = useState('')
    const [zp, setZp] = useState(0)
    const [masterId, setMasterId] = useState(0)
    const [cash, setCash] = useState(false)

    const [model, setModel] = useState('')
    const [category_id, setCategory_id] = useState(0)
    const [isTreeOpen, setIsTreeOpen] = useState(false)

    const {enqueueSnackbar} = useSnackbar()

    const stock = props.app.stocks.find(s => s.id === props.app.current_stock_id)
    const category = props.app.categories.find(c => c.id === category_id)

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
                    props.done()

                    enqueueSnackbar('ok', {variant: 'success'})

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

    const handleTree = id => {

        setIsTreeOpen(false)
        setCategory_id(+id)

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

        {!props.barcode && <>

            {isTreeOpen
                ? <Tree
                    initialId={category_id}
                    categories={props.app.categories}
                    finished={id => handleTree(id)}
                    onSelected={id => {
                    }}
                />
                : <Button size="small"
                          className="w-100"
                          onClick={() => setIsTreeOpen(true)}
                >
                    {category ? category.name : 'Выбрать категорию...'}
                </Button>}

            {line('Наименование:', model, true, e => setModel(e.target.value))}

        </>}

        <Button
            className="m-2"
            variant="outlined"
            onClick={() => produce()}
        >
            {props.button ?? "Добавить работу"}
        </Button>

    </div>

}

export default connect(state => state)(AddCosts)