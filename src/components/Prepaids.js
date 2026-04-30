import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";

import {
    Table,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Typography,
    TextField,
    InputAdornment
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from "@mui/icons-material/Close";

import rest from './Rest'
import PrepaidModal from "./Modals/Prepaid";
import TwoLineInCell from "./common/TwoLineInCell";
import {toLocalTimeStr} from "./common/Time";

const toLowerSafe = value => String(value || '').toLowerCase();

const Prepaids = props => {

    const [isPrepaidOpen, setIsPrepaidOpen] = useState(false)
    const [prepaidId, setPrepaidId] = useState()
    const [prepaidData, setPrepaidData] = useState()
    const [prepaids, setPrepaids] = useState([])
    const [search, setSearch] = useState('')
    const routePrepaidId = +props.match.params.id || 0

    const getPrepaids = () => {

        if (props.app.current_stock_id) {

            rest('prepaids/' + props.app.current_stock_id)
                .then(res => {
                    if (res.status === 200) {

                        setPrepaids(res.body)

                    }
                })
        }
    }

    useEffect(() => {
        getPrepaids()
    }, [props.app.current_stock_id])

    useEffect(() => {
        if (!routePrepaidId) return

        setPrepaidId(routePrepaidId)
        setPrepaidData()
        setIsPrepaidOpen(true)
    }, [routePrepaidId])

    const openPrepaid = prepaid => {

        setPrepaidId(prepaid.id)
        setPrepaidData(prepaid)
        setIsPrepaidOpen(true)

    }

    return <div
        style={{
            backgroundColor: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--line)',
            borderRadius: 5,
            padding: '1rem'
        }}
    >

        {isPrepaidOpen && <PrepaidModal
            isOpen={isPrepaidOpen}
            close={() => {
                setIsPrepaidOpen(false)
                setPrepaidId(null)
                if (routePrepaidId) props.history.push('/prepaids')
            }}
            preId={prepaidId}
            preData={prepaidData}
            setPrepaids={setPrepaids}
            className='non-printable'
        />}

        {prepaids
            ? <Table size="small" style={{
                background: 'var(--surface)',
                color: 'var(--text)',
            }}>
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={2} style={{color: 'var(--text)'}}>
                            <Typography variant="h6">
                                Предоплаты
                            </Typography>
                        </TableCell>
                        <TableCell align="right" style={{color: 'var(--text)'}}>
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
                        <TableCell align="right" style={{color: 'var(--text)'}}>
                            <Tooltip title={'Добавить предоплату'}>
                                <IconButton style={{
                                    padding: 0,
                                    marginLeft: '.1rem',
                                    marginRight: '.1rem',
                                }}
                                            onClick={() => setIsPrepaidOpen(true)}
                                >
                                    <AddCircleIcon/>
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableHead>
                    <TableRow>
                        <TableCell>Дата</TableCell>
                        <TableCell>Наименование</TableCell>
                        <TableCell>Заказчик</TableCell>
                        <TableCell>Статус</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {prepaids
                        ? prepaids
                            .filter(p => {

                                if (!search) return true

                                const fio = toLowerSafe(p.customer?.fio)
                                const pn = toLowerSafe(p.customer?.phone_number)
                                const time = toLowerSafe(p.time)
                                const item = toLowerSafe(p.item)

                                let r = true

                                search.toLowerCase()
                                    .split(' ')
                                    .map(s => {

                                        if (fio.indexOf(s) < 0 && pn.indexOf(s) < 0 && time.indexOf(s) < 0 && item.indexOf(s) < 0) {
                                            r = false
                                        }

                                    })

                                return r

                            })
                            .map(p => {

                                const localTimeString = toLocalTimeStr(p.unix)
                                const date = localTimeString.slice(0, -9)
                                const time = localTimeString.slice(-8)

                                return <TableRow
                                    key={'table-row-in-prepaids' + p.id + p.time}
                                    style={{
                                        cursor: 'pointer',
                                        background: 'var(--surface)',
                                        color: 'var(--text)'
                                    }}
                                    onClick={() => openPrepaid(p)}
                                >
                                    <TableCell style={{color: 'var(--text)'}}>
                                        {TwoLineInCell(date, time)}
                                    </TableCell>
                                    <TableCell style={{color: 'var(--text)'}}>{p.item}</TableCell>
                                    <TableCell style={{color: 'var(--text)'}}>
                                        {p.customer
                                            ? TwoLineInCell(p.customer.phone_number, p.customer.fio)
                                            : null}
                                    </TableCell>
                                    <TableCell style={{color: 'var(--text)'}}>{p.status}</TableCell>
                                </TableRow>
                            })
                        : null}
                </TableBody>
            </Table>
            : 'Предоплаты не найдены'}
    </div>

}

export default connect(state => state)(Prepaids)
