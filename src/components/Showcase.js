import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import GoodModal from "./Modals/Good";
import rest from "../components/Rest";
import TableHead from "@material-ui/core/TableHead";
import {InputAdornment, Table, TableBody, TableCell, TableRow, TextField} from "@material-ui/core";
import TwoLineInCell from "./common/TwoLineInCell";
import SearchIcon from "@material-ui/icons/Search";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";


const statuses = {
    sale: 'На витрине',
    check: 'На проверке',
    parts: 'На запчасти'
}

let all

const Showcase = props => {

    const [good, setGood] = useState({})
    const [showcase, setShowcase] = useState([])
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')

    useEffect(() => {

        rest('goods/showcase')
            .then(res => {
                if (res.status === 200) {
                    setShowcase(res.body)
                }
            })

        all = false

    }, [])

    useEffect(() => {

        setShowcase(showcase.map(s => s.id === good.id ? good : s))

    }, [good])

    useEffect(() => {

        if (all || !status || status === 'sale') return

        rest('goods/showcase/all')
            .then(res => {
                if (res.status === 200) {
                    all = true
                    setShowcase(res.body)
                }
            })

    }, [status])

    return <>

        <GoodModal
            good={good}
            setGood={setGood}
            close={() => setGood({})}
        />


        <div style={{
            display: 'flex',
            justifyContent: 'space-between'
        }}
        >

            <Select style={{
                margin: '1rem',
                width: '50%'
            }}
                value={status}
                onChange={e => setStatus(e.target.value)}
                label="статус"
            >
                <MenuItem key={'menuiteminshowcasestatuseskey0'}
                          value="">
                    <br/>
                </MenuItem>
                {Object.entries(statuses)
                    .map(([index, name]) => <MenuItem key={'menuiteminshowcasestatuseskey' + index}
                                                      value={index}>
                        {name}
                    </MenuItem>)}
            </Select>

            <TextField style={{
                margin: '1rem',
            }}
                       InputProps={{
                           startAdornment: (
                               <InputAdornment position="start">
                                   <SearchIcon/>
                               </InputAdornment>
                           ),
                       }}
                       value={search}
                       onChange={e => setSearch(e.target.value)}
            />
        </div>

        {showcase.length
            ? <Table size="small"
                     style={{
                         background: 'white'
                     }}
            >
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Группа</TableCell>
                        <TableCell>Наименование / imei</TableCell>
                        <TableCell>Цена</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {showcase
                        .filter(s => props.app.stock_id
                            ? props.app.stock_id === s.stock_id
                            : true)
                        .filter(s => !status || s.parts === status)
                        .filter(s => !search || s.model.indexOf(search) > -1 ||
                            s.imei.indexOf(search) > -1 || s.sum == search || s.id == search)
                        .map(s => <TableRow key={'tablerowinshowcase' + s.id}
                                            style={{
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setGood(s)}
                        >
                            <TableCell>{s.id}</TableCell>
                            <TableCell>{s.group}</TableCell>
                            <TableCell>
                                {TwoLineInCell(s.model, s.imei)}
                            </TableCell>
                            <TableCell>
                                {s.sum}
                            </TableCell>
                        </TableRow>)}
                </TableBody>
            </Table>
            : 'Нет данных'}

    </>

}

export default connect(state => state)(Showcase)