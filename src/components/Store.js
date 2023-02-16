import React, {useEffect, useRef, useState} from "react";
import {connect} from "react-redux";
import {
    Button,
    Checkbox, FormControlLabel,
    IconButton,
    InputAdornment, LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TextField
} from "@material-ui/core";
import uuid from "uuid";
import Tree from "./Tree";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";

import rest from "../components/Rest";
import TableHead from "@material-ui/core/TableHead";
import TwoLineInCell from "./common/TwoLineInCell";
import SearchIcon from "@material-ui/icons/Search";
import {toLocalTimeStr} from "./common/Time";
import GoodModal from "./Modals/Good";
import {groupAlias} from "./common/GroupAliases";


const oftenUsedButtons = [
    {label: 'Аксессуары', catId: 6},
    {label: 'Запчасти', catId: 4},
    {label: 'Техника', catId: 5},
    {label: 'Расходники', catId: 999},
]

const style = {
    display: 'flex',
    justifyContent: 'space-around',
    margin: '.5rem',
}

const Store = props => {

    const [goods, setGoods] = useState([])
    const [good, setGood] = useState({})
    const [catId, setCatId] = useState(0)
    const [isExpand, setIsExpand] = useState(false)
    const [error, setError] = useState(false)
    const [search, setSearch] = useState('')
    const [isMyStock, setIsMyStock] = useState(false)
    const [isPublic, setIsPublic] = useState(false)

    const limit = useRef(25)
    const isRequest = useRef(false)

    const currentStock = props.app.stocks.find(s => s.id === props.app.current_stock_id)

    const sendRequest = () => {

        if (isRequest.current) return
        isRequest.current = true

        let url = 'goods?'
        if (catId) url += '&category_id=' + catId
        if (search) url += '&search=' + search
        if (isMyStock && currentStock) url += '&stock_id=' + currentStock.id
        if (isPublic) url += '&is_public=1'

        if (limit.current > 25) url += '&limit=' + limit.current

        rest(url)
            .then(res => {
                isRequest.current = false
                if (res.status === 200) {

                    if (goods.length === res.body.length) limit.current = 0

                    setGoods(res.body)

                }
            })

    }

    useEffect(() => {

        if (props.scrollDown) {

            props.setScrollDown(false)

            if (limit.current > 0) {
                limit.current += 25
                sendRequest()
            }

        }

    }, [props.scrollDown])

    useEffect(() => {

        sendRequest()

    }, [])

    useEffect(() => {

        if (props.enterPress) find()

        if (typeof (props.setEnterPress) === 'function') props.setEnterPress(false)

// eslint-disable-next-line
    }, [props.enterPress])

    useEffect(() => {

        if (good) {

            const newGoods = goods.map(g => g.id === good.id ? good : g)
            setGoods(newGoods)

        }

    }, [good])

    const setCat = id => {

        id = +id

        setCatId(id)

        if (oftenUsedButtons.length < 8) {

            const cat = props.app.categories.find(c => c.id === id)

            if (cat && cat.id > 6 && cat.id < 999) {

                setIsExpand(false)

                const r = oftenUsedButtons.find(b => b.catId === cat.id)

                if (!r) oftenUsedButtons.push({
                    label: cat.name,
                    catId: cat.id
                })

            }

        }


    }

    const find = () => {

        limit.current = 25
        sendRequest()

    }

    const searchHandle = v => {

        setError(false)
        limit.current = 25
        setSearch(v)

    }

    const hide = id => console.log(id)

    return <>

        <GoodModal
            good={good}
            setGood={setGood}
            close={() => setGood({})}
            hide={hide}
        />

        <div className="w-100">

            {isExpand
                ? <Tree categories={props.app.categories}
                        onSelected={id => setCat(id)}
                        finished={id => setCat(id)}
                />
                : <IconButton onClick={() => setIsExpand(!isExpand)}>
                    <ExpandLessIcon/>
                </IconButton>}

            {oftenUsedButtons.map(b => <Button
                key={uuid()}
                size="small"
                style={{margin: '.5rem'}}
                color={catId === b.catId ? "primary" : "default"}
                variant={catId === b.catId ? "contained" : "outlined"}
                onClick={() => setCatId(b.catId)}>
                {b.label}
            </Button>)}

        </div>

        <div style={style}>

            <TextField
                disabled={isRequest.current}
                error={error}
                autoFocus
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon/>
                        </InputAdornment>
                    ),
                }}
                value={search}
                onChange={e => searchHandle(e.target.value)}
            />

            <Button onClick={find}
                    disabled={isRequest.current}
            >
                Найти
            </Button>

        </div>

        <div style={style}>

            {currentStock && <FormControlLabel control={
                <Checkbox checked={isMyStock} onChange={() => setIsMyStock(!isMyStock)}/>}
                                               label={"только " + currentStock.name}
            />}

            <FormControlLabel control={
                <Checkbox checked={isPublic} onChange={() => setIsPublic(!isPublic)}/>}
                              label={"только опубликованные"}
            />

        </div>

        {goods.length
            ? <Table size="small"
                     style={{background: 'white'}}
            >
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Товар</TableCell>
                        <TableCell>Цена / Себестоимость</TableCell>
                        <TableCell>Хранение</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {goods
                        .filter(s => !isPublic || s.public || s.parts === 'sale')
                        .filter(s => !isMyStock || s.stock_id === currentStock.id)
                        .filter(s => {

                            if (!search || s.sum == search || s.id == search) return true

                            const model = s.model.toLowerCase()

                            const imei = s.imei && s.imei.toLowerCase()

                            let r = true

                            search.toLowerCase()
                                .split(' ')
                                .map(s => {

                                    if (model.indexOf(s) < 0) {

                                        r = imei && imei.indexOf(s) > -1

                                    }

                                })

                            return r


                        })
                        .map(g => {

                            const color = g.wo === 't'
                                ? 'green'
                                : g.wo === 'reject'
                                    ? 'red'
                                    : 'black'

                            const stock = props.app.stocks.find(s => s.id === g.stock_id)

                            const inTime = new Date(g.time).getTime()
                            const outTime = new Date(g.outtime).getTime()
                            const storageTime = new Date(g.storage_time).getTime()

                            const checkTime = Math.max(inTime || 0, outTime || 0, storageTime || 0)

                            const checkTimeStr = toLocalTimeStr(checkTime / 1000)

                            if (!g.category_id && g.group) {
                                Object.entries(groupAlias).map(([cat, groupName]) => {
                                    if (g.group === groupName) g.category_id = +cat
                                })
                            }

                            const category = g.category_id
                                ? props.app.categories.find(c => c.id === g.category_id)
                                : null

                            const storage = g.wo === 't'
                                ? TwoLineInCell('Транзит', checkTimeStr)
                                : g.wo === 'reject'
                                    ? TwoLineInCell('брак', checkTimeStr)
                                    : !stock || g.stock_id === props.app.current_stock_id
                                        ? TwoLineInCell(g.storage_place, checkTimeStr)
                                        : TwoLineInCell(stock.name, g.storage_place || checkTimeStr)

                            let description
                            if (category) description = category.name
                            if (g.imei) description = description
                                ? description + ', ' + g.imei
                                : g.imei

                            const opacity = g.wo === 't' || props.app.current_stock_id !== g.stock_id
                                ? '50%'
                                : '100%'

                            return <TableRow key={uuid()}
                                             style={{
                                                 cursor: 'pointer',
                                                 opacity,
                                             }}
                                             onClick={() => setGood(g)}
                            >
                                <TableCell style={{color}}>
                                    {g.id}
                                </TableCell>
                                <TableCell style={{color}}>
                                    {TwoLineInCell(g.model, description)}
                                </TableCell>
                                <TableCell style={{color}}>
                                    {TwoLineInCell(g.sum, g.remcost || g.cost)}
                                </TableCell>
                                <TableCell style={{color}}>
                                    {storage}
                                </TableCell>
                            </TableRow>
                        })}

                    {isRequest.current && <TableRow>
                        <TableCell colSpan={4}>
                            <LinearProgress/>
                        </TableCell>
                    </TableRow>}

                </TableBody>
            </Table>
            : 'Нет данных'}

    </>

}

export default connect(state => state)(Store)