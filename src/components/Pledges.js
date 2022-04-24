import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";

import rest from "../components/Rest"
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import {InputAdornment, Table, TableBody, TextField, Typography} from "@material-ui/core";
import TwoLineInCell from "./common/TwoLineInCell";
import SearchIcon from "@material-ui/icons/Search";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import AddCircleIcon from "@material-ui/icons/AddCircle";

import Pledge from "./Pledge";

const Pledges = props => {

    const [search, setSearch] = useState('')
    const [pledges, setPledges] = useState([])

    const [currentPledge, setCurrentPledge] = useState()

    useEffect(() => {

        rest('pledges')
            .then(res => {

                if (res.status === 200) {
                    setPledges(res.body)
                }

            })

    }, [])

    const addPledge = pledge => {

        const arr = [...pledges]
        arr.unshift(pledge)

        setPledges(arr)
        setCurrentPledge(pledge)

    }

    const updPledge = pledge => {

    }

    const delPledge = id => {

        setPledges(pledges.filter(p => p.id !== id))

        setCurrentPledge()

    }

    const dateNow = Date.now()

    const getSum2 = (date1, date2, sum) => {

        const days = Math.ceil((date2 - date1) / 86400000)

        const min = +props.app.config.zalog_min_sum ?? 500
        const percent = +props.app.config.zalog_day_percent ?? 3

        const daily = sum * percent / 100
        const prof = daily * days

        return 50 * Math.round((sum + (min < prof ? prof : min)) / 50)

    }

    return currentPledge
        ? <Pledge
            current={currentPledge}
            setCurrent={setCurrentPledge}
            addPledge={addPledge}
            updPledge={updPledge}
            delPledge={delPledge}
            getSum2={getSum2}
        />
        : <div style={{
            backgroundColor: '#fff',
            borderRadius: 5,
            padding: '1rem'
        }}
        >
            <Table size="small">

                <TableHead>
                    <TableRow>
                        <TableCell>
                            <Typography variant="h6">
                                Залоги
                            </Typography>
                        </TableCell>
                        <TableCell align="right">
                            <TextField InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon/>
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setSearch('')}>
                                            <CloseIcon/>
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                                       value={search}
                                       onChange={e => setSearch(e.target.value)}
                            />
                        </TableCell>
                        <TableCell align="right">
                            <Tooltip title={'Новый залог'}>
                                <IconButton style={{
                                    padding: 0,
                                    marginLeft: '.1rem',
                                    marginRight: '.1rem',
                                }}
                                            onClick={() => setCurrentPledge({})}
                                >
                                    <AddCircleIcon/>
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                </TableHead>

                <TableHead>
                    <TableRow>
                        {props.app.stock_id
                            ? null
                            : <TableCell>Точка</TableCell>}
                        <TableCell>Устройство</TableCell>
                        <TableCell>Дата выкупа</TableCell>
                        <TableCell>Сумма выкупа</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pledges
                        .filter(p => !props.app.stock_id || props.app.stock_id === p.stock)
                        .filter(p => {

                            if (!search) return true

                            const model = p.model.toLowerCase()
                            const imei = p.imei.toLowerCase()

                            let r = true

                            search.toLowerCase()
                                .split(' ')
                                .map(s => {

                                    if (imei.indexOf(s) < 0 && model.indexOf(s) < 0) {
                                        r = false
                                    }

                                })

                            return r

                        })
                        .map(p => {

                            const stock = props.app.stocks.find(s => s.id === p.stock)
                            const timeZone = stock.timezone_offset ?? 0

                            const isDelay = (Date.now() - Date.parse(p.ransomdate)) / 3600000 + timeZone > 24

                            return <TableRow style={{
                                cursor: 'pointer',
                            }}
                                             key={'table-row-key-in-pledges-' + p.id}
                                             onClick={() => setCurrentPledge(p)}
                            >
                                {[props.app.stock_id ? null : stock.name,
                                    TwoLineInCell(p.model, p.imei),
                                    p.ransomdate,
                                    isDelay ? getSum2(Date.parse(p.time), dateNow, p.sum) : p.sum2]
                                    .map(c => c && <TableCell key={'cell-key-in-pledges-' + p.id + c}
                                                         style={{color: isDelay ? 'red' : 'black'}}>
                                        {c}
                                    </TableCell>)}
                            < /TableRow>
                        })}
                </TableBody>
            </Table>
        </div>

}

export default connect(state => state)(Pledges)