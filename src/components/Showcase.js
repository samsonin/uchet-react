import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import rest from "../components/Rest";
import TableHead from "@mui/material/TableHead";
import {InputAdornment, Table, TableBody, TableCell, TableRow, TextField} from "@mui/material";
import TwoLineInCell from "./common/TwoLineInCell";
import SearchIcon from "@mui/icons-material/Search";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const toLowerSafe = value => String(value || '').toLowerCase();

const statuses = {
    all: 'Вся',
    sale: 'На продаже',
    check: 'На проверке',
    parts: 'На запчасти'
}

let isAllShowcaseInUI

const Showcase = props => {

    const [good, setGood] = useState({})
    const [showcase, setShowcase] = useState([])
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('sale')

    useEffect(() => {

        rest('goods/showcase')
            .then(res => {
                if (res.status === 200) {
                    setShowcase(res.body)
                }
            })

        isAllShowcaseInUI = false

    }, [])

    useEffect(() => {

        setShowcase(showcase.map(s => s.id === good.id ? good : s))

    }, [good])

    useEffect(() => {

        if (isAllShowcaseInUI || status === 'sale') return

        rest('goods/showcase/all')
            .then(res => {
                if (res.status === 200) {
                    isAllShowcaseInUI = true
                    setShowcase(res.body)
                }
            })

    }, [status])

    // const hide = id => setShowcase(showcase.filter(s => s.id !== id))

    return <>

        <div style={{
            display: 'flex',
            justifyContent: 'space-between'
        }}
        >

            <Select style={{margin: '1rem'}}
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    label="статус"
            >
                {Object.entries(statuses)
                    .map(([index, name]) => <MenuItem key={'menuiteminshowcasestatuseskey' + index}
                                                      value={index}>
                        {name}
                    </MenuItem>)}
            </Select>

            <TextField style={{
                margin: '1rem',
            }}
                       slotProps={{
                           input: {
                               startAdornment: (
                                   <InputAdornment position="start">
                                       <SearchIcon/>
                                   </InputAdornment>
                               ),
                           },
                       }}
                       value={search}
                       onChange={e => setSearch(e.target.value)}
            />

            <Tooltip title={'Купить'}>
                <IconButton onClick={() => props.history.push('/showcase/buy')}>
                    <AddCircleIcon/>
                </IconButton>
            </Tooltip>

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
                        .filter(s => props.app.current_stock_id
                            ? props.app.current_stock_id === s.stock_id
                            : true)
                        .filter(s => ['all', s.parts].includes(status))
                        .filter(s => {

                            if (!search || s.sum == search || s.id == search) return true

                            const model = toLowerSafe(s.model)
                            const imei = toLowerSafe(s.imei)

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
