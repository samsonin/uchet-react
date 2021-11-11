import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";

import rest from './Rest'
import {Table, TableBody, TableRow, TableHead, TableCell, Typography} from "@material-ui/core";
import PrepaidModal from "./Modals/Prepaid";
import TwoLineInCell from "./common/TwoLineInCell";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from "@material-ui/icons/AddCircle";

const Prepaids = props => {

    const [isPrepaidOpen, setIsPrepaidOpen] = useState(false)
    const [prepaidId, setPrepaidId] = useState()
    const [prepaidData, setPrepaidData] =useState()
    const [prepaids, setPrepaids] = useState([])

    const getPrepaids = () => {

        if (props.app.stock_id) {

            rest('prepaids/' + props.app.stock_id)
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
    }, [props.app.stock_id])

    const openPrepaid = prepaid => {

        setPrepaidId(prepaid.id)

        prepaid.id = undefined

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
                        <TableCell colSpan={3}>
                            <Typography variant="h6">
                                Предоплаты
                            </Typography>
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
                        ? prepaids.map(p => <TableRow
                            key={'tablerowinprepaids' + p.id}
                            style={{
                                cursor: 'pointer'
                            }}
                            onClick={() => openPrepaid(p)}
                        >
                            <TableCell>{p.time}</TableCell>
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