import React, {useRef, useState} from "react";
import {connect} from "react-redux";
import {Button, IconButton, InputAdornment, Table, TableBody, TableCell, TableRow, TextField} from "@material-ui/core";
import uuid from "uuid";
import Tree from "./Tree";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";

import rest from "../components/Rest";
import TableHead from "@material-ui/core/TableHead";
import TwoLineInCell from "./common/TwoLineInCell";
import SearchIcon from "@material-ui/icons/Search";


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
    const [catId, setCatId] = useState(0)
    const [isExpand, setIsExpand] = useState(false)
    const [isRest, setIsRest] = useState(false)
    const [search, setSearch] = useState('')

    const limit = useRef(25)

    const sendRequest = () => {

        setIsRest(true)

        let url = 'goods?'
        if (catId) url += '&category_id=' + catId
        if (search) url += '&search=' + search

        if (limit.current > 25) url += '&limit=' + limit.current

        rest(url)
            .then(res => {
                setIsRest(false)
                if (res.status === 200) setGoods(res.body)
            })

    }


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

    const more = () => {

        limit.current += 25
        sendRequest()

    }

    const searchHandle = v => {

        limit.current = 25
        setSearch(v)

    }

    return <>

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
                disabled={isRest}
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
                    disabled={isRest}
            >
                Найти
            </Button>

        </div>

        {goods.length
            ? <Table size="small"
                     style={{background: 'white'}}
            >
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Группа</TableCell>
                        <TableCell>Наименование / imei</TableCell>
                        <TableCell>Цена / Себестоимость</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {goods
                        .filter(s => {

                            if (!search || s.sum == search || s.id == search) return true

                            const model = s.model.toLowerCase()
                            const imei = s.imei.toLowerCase()

                            let r = true

                            search.toLowerCase()
                                .split(' ')
                                .map(s => {

                                    if (model.indexOf(s) < 0 && imei.indexOf(s) < 0) {
                                        r = false
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

                            const opacity = props.app.stock_id === g.stock_id ? '100%' : '50%'

                            return <TableRow key={'tablerowingoods' + g.id}
                                             style={{
                                                 cursor: 'pointer',
                                                 opacity,
                                             }}
                                             onClick={() => console.log(g)}
                            >
                                <TableCell style={{color}}>
                                    {g.id}
                                </TableCell>
                                <TableCell style={{color}}>
                                    {g.group}
                                </TableCell>
                                <TableCell style={{color}}>
                                    {TwoLineInCell(g.model, g.imei)}
                                </TableCell>
                                <TableCell style={{color}}>
                                    {g.sum}
                                </TableCell>
                            </TableRow>
                        })}

                    <TableRow>
                        <TableCell colSpan={4}>
                            <Button className="w-100"
                                    disabled={isRest}
                                    size="small"
                                    onClick={more}
                            >
                                Показать еще
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            : 'Нет данных'}

    </>

}

export default connect(state => state)(Store)