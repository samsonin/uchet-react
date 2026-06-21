import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import { v4 as uuid } from "uuid";

import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import {InputAdornment, Table, TableBody, TextField, Typography} from "@mui/material";
import TwoLineInCell from "./common/TwoLineInCell";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";
import AddCircleIcon from "@mui/icons-material/AddCircle";

import rest from "../components/Rest"
import Pledge from "./Pledge";

const toLowerSafe = value => String(value || '').toLowerCase();

const Pledges = props => {
    const appStocks = props.app.stocks || []
    const appConfig = props.app.config || {}

    const [search, setSearch] = useState('')
    const [pledges, setPledges] = useState([])

    const [currentPledge, setCurrentPledge] = useState()

    const dateNow = Date.now()
    const tableColumnCount = props.app.current_stock_id ? 3 : 4
    const routePledgeId = +props.match.params.id || 0

    const getSum2 = (date1, date2, sum) => {

        const days = Math.ceil((date2 - date1) / 86400000)

        const min = +(appConfig.zalog_min_sum ?? 500)
        const percent = +(appConfig.zalog_day_percent ?? 3)

        const daily = sum * percent / 100
        const prof = daily * days

        return 50 * Math.round((sum + (min < prof ? prof : min)) / 50)

    }

    const preparePledge = pledge => {
        const stock = appStocks.find(s => s.id === pledge.stock)
        const timeZone = stock?.timezone_offset ?? 0

        const prepared = {
            ...pledge,
            stockName: stock?.name || '',
            isDelay: (dateNow - Date.parse(pledge.ransomdate)) / 3600000 + timeZone > 24,
        }

        if (prepared.isDelay) {

            const sum2 = getSum2(Date.parse(prepared.time), dateNow, prepared.sum)

            prepared.sum2 = Math.max(sum2, prepared.sum2)

        }

        return prepared
    }

    useEffect(() => {

        if (routePledgeId) return

        rest('pledges')
            .then(res => {

                if (res.status === 200) {

                    setPledges(res.body.map(preparePledge))

                }

            })

    }, [routePledgeId])

    useEffect(() => {

        if (!routePledgeId) return

        rest('pledges/' + routePledgeId)
            .then(res => {

                if (res.status !== 200 || !res.body) return

                const pledge = res.body.pledge || res.body

                setCurrentPledge(preparePledge(pledge))

            })

    }, [routePledgeId])

    const addPledge = pledge => {

        const newPledges = [...pledges]
        newPledges.unshift(pledge)

        setPledges(newPledges)
        setCurrentPledge(pledge)

    }

    const updPledge = pledge => {

        const newPledges = pledges.map(p => p.id === pledge.id ? pledge : p)

        setPledges(newPledges)
        setCurrentPledge(pledge)

    }

    const delPledge = id => {

        setPledges(pledges.filter(p => p.id !== id))

        setCurrentPledge()

    }

    const openPledge = pledge => {

        if (!pledge?.id) {
            setCurrentPledge(pledge)
            return
        }

        setCurrentPledge(preparePledge(pledge))

        rest('pledges/' + pledge.id)
            .then(res => {

                if (res.status !== 200 || !res.body) return

                const detailedPledge = res.body.pledge || res.body

                setCurrentPledge(preparePledge(detailedPledge))

            })

    }

    let total = 0

    return currentPledge
        ? <Pledge
            current={currentPledge}
            setCurrent={pledge => {
                setCurrentPledge(pledge)
                if (!pledge && routePledgeId) props.history.push('/pledges')
            }}
            getSum2={getSum2}
            addPledge={addPledge}
            updPledge={updPledge}
            delPledge={delPledge}
        />
        : <div style={{
            backgroundColor: 'var(--surface)',
            color: 'var(--text)',
            borderRadius: 5,
            padding: '1rem',
            border: '1px solid var(--line)',
        }}
        >
            <Table size="small">

                <TableHead>
                    <TableRow>
                        <TableCell style={{color: 'var(--text)'}}>
                            <Typography variant="h6">
                                Залоги
                            </Typography>
                        </TableCell>
                        <TableCell align="right">
                            <TextField slotProps={{
                                input: {
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
                                },
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
                        {props.app.current_stock_id
                            ? null
                            : <TableCell>Точка</TableCell>}
                        <TableCell>Устройство</TableCell>
                        <TableCell>Дата выкупа</TableCell>
                        <TableCell>Сумма выкупа</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pledges
                        .filter(p => !props.app.current_stock_id || props.app.current_stock_id === p.stock)
                        .filter(p => {

                            if (!search) return true

                            const model = toLowerSafe(p.model)
                            const imei = toLowerSafe(p.imei)

                            let r = true

                            search.toLowerCase()
                                .split(' ')
                                .map(s => {

                                    if (imei.indexOf(s) < 0 && model.indexOf(s) < 0) {
                                        r = false
                                    }
                                    return s

                                })

                            return r

                        })
                        .map(p => {

                            total += p.sum2

                            return <TableRow style={{
                                cursor: 'pointer',
                            }}
                                             key={uuid()}
                                             onClick={() => openPledge(p)}
                            >
                                {[props.app.current_stock_id ? null : p.stockName,
                                    TwoLineInCell(p.model, p.imei),
                                    p.ransomdate,
                                    p.sum2]
                                    .map(c => c && <TableCell key={uuid()}
                                                              style={{color: p.isDelay ? 'var(--danger)' : 'var(--text)'}}>
                                        {c}
                                    </TableCell>)}
                            < /TableRow>
                        })}
                    {total > 0 && <TableRow>
                        <TableCell align={"right"} colSpan={tableColumnCount - 1}>Итого</TableCell>
                        <TableCell style={{color: 'var(--text)'}}>
                            <span style={{fontWeight: 'bold'}}>{total}</span>
                        </TableCell>

                    </TableRow>}
                </TableBody>
            </Table>
        </div>
}

export default connect(state => state)(Pledges)
