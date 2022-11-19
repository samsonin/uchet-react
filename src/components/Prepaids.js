import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";

import rest from './Rest'
import {
    Table,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Typography,
    TextField,
    InputAdornment
} from "@material-ui/core";
import PrepaidModal from "./Modals/Prepaid";
import TwoLineInCell from "./common/TwoLineInCell";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from "@material-ui/icons/Close";

const Prepaids = props => {

    const [isPrepaidOpen, setIsPrepaidOpen] = useState(false)
    const [prepaidId, setPrepaidId] = useState()
    const [prepaidData, setPrepaidData] = useState()
    const [prepaids, setPrepaids] = useState([])
    const [search, setSearch] = useState('')

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
    }, [])

    useEffect(() => {
        getPrepaids()
    }, [props.app.current_stock_id])

    useEffect(() => {


    }, [search])

    const openPrepaid = prepaid => {

        setPrepaidId(prepaid.id)
        setPrepaidData(prepaid)
        setIsPrepaidOpen(true)

    }

    return <div
        style={{
            backgroundColor: '#fff',
            borderRadius: 5,
            padding: '1rem'
        }}
    >

        {isPrepaidOpen && <PrepaidModal
            isOpen={isPrepaidOpen}
            close={() => {
                setIsPrepaidOpen(false)
                setPrepaidId(null)
            }}
            preId={prepaidId}
            preData={prepaidData}
            setPrepaids={setPrepaids}
            className='non-printable'
        />}

        {prepaids
            ? <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Typography variant="h6">
                                Предоплаты
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

                                const fio = p.customer.fio.toLowerCase()
                                const pn = p.customer.phone_number.toLowerCase()
                                const time = p.time.toLowerCase()
                                const item = p.item.toLowerCase()

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
                            .map(p => <TableRow
                                key={'tablerowinprepaids' + p.id + p.time}
                                style={{
                                    cursor: 'pointer'
                                }}
                                onClick={() => openPrepaid(p)}
                            >
                                <TableCell>
                                    {TwoLineInCell(p.time.substring(0, 10), p.time.substring(11))}
                                </TableCell>
                                <TableCell>{p.item}</TableCell>
                                <TableCell>
                                    {p.customer
                                        ? TwoLineInCell(p.customer.phone_number, p.customer.fio)
                                        : null}
                                </TableCell>
                                <TableCell>{p.status}</TableCell>
                            </TableRow>)
                        : null}
                </TableBody>
            </Table>
            : 'Предоплаты не найдены'}
    </div>

}

export default connect(state => state)(Prepaids)