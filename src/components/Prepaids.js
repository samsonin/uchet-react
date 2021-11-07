import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";

import rest from './Rest'
import {Table, TableBody, TableRow, TableHead, TableCell} from "@material-ui/core";
import PrepaidModal from "./Modals/Prepaid";

const Prepaids = props => {

    const [isPrepaidOpen, setIsPrepaidOpen] = useState(false)
    const [prepaidId, setPrepaidId] = useState()
    const [prepaids, setPrepaids] = useState([])

    useEffect(() => {

        rest('prepaids/' + props.app.stock_id)
            .then(res => {
                if (res.status === 200) {

                    setPrepaids(res.body)

                }
            })

    }, [])

    const openPrepaid = id => {

        setIsPrepaidOpen(true)
        setPrepaidId(id)

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
            prepaid_id={prepaidId}
            stock_id={props.app.stock_id}
        />}

        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Дата</TableCell>
                    <TableCell>Наименование</TableCell>
                    <TableCell>Заказчик</TableCell>
                    <TableCell>Статус</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {prepaids.map(p => <TableRow
                    style={{
                        cursor: 'pointer'
                    }}
                    onClick={() => openPrepaid(p.id)}
                >
                    <TableCell>{p.time}</TableCell>
                    <TableCell>{p.item}</TableCell>
                    <TableCell>
                        {p.customer
                            ? <TableCell>
                                <span className="font-weight-bold">{p.customer.phone_number}</span>
                                <br/>
                                {p.customer.fio}
                            </TableCell>
                            : p.customer_id
                                ? 'не идентифицирован'
                                : 'не определен'}
                    </TableCell>
                    <TableCell>{p.status}</TableCell>
                </TableRow>)}
            </TableBody>
        </Table>
    </div>

}

export default connect(state => state)(Prepaids)