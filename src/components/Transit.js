import React, {useEffect, useState} from "react";

import rest from "../components/Rest"
import TableContainer from "@material-ui/core/TableContainer";
import {Paper} from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import TableBody from "@material-ui/core/TableBody";
import {connect} from "react-redux";

import IconButton from "@material-ui/core/IconButton";
import CheckIcon from '@material-ui/icons/Check';
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import {MDBBtn, MDBContainer, MDBModal, MDBModalBody, MDBModalFooter, MDBModalHeader} from "mdbreact";
import TextField from "@material-ui/core/TextField/TextField";
import {useSnackbar} from "notistack";
import {v4 as uuidv4} from 'uuid';


const Transit = props => {

    const [infoOpen, setInfoOpen] = useState(false)

    const [good, setGood] = useState({})

    const getInfo = (good, target) => {

        if (target.tagName === 'TD') {
            setGood(good)
            setInfoOpen(true)
        }

    }

    const {enqueueSnackbar} = useSnackbar()

    useEffect(() => {

        if (!props.newScan) return

        if (props.current_stock_id) {

            rest('transit/' + props.current_stock_id + '/' + props.newScan, 'PATCH')
                .then(res => {

                    if (res.status === 200) {

                        enqueueSnackbar('ok', {variant: 'success'})

                    }

                })

        } else {

            enqueueSnackbar('выберете точку', {variant: 'error'})

        }

        if (typeof (props.setOurBarcode) === 'function') props.setOurBarcode()

// eslint-disable-next-line
    }, [props.newScan])

    const fromTransit = (e, good) => {

        if (!props.current_stock_id) return enqueueSnackbar('выберете точку', {variant: 'error'})

        let tr = e.target.closest('tr')
        if (tr) tr.classList.add('transition-hidden')

        rest('transit/' + props.current_stock_id + '/' + good.barcode, 'DELETE')
            .then(res => {

                if (res.status === 200) {

                    enqueueSnackbar('ok', {variant: 'success'})

                    setInfoOpen(false)
                    return true
                }

                if (tr) tr.classList.remove('transition-hidden')

                return false

            })

    }

    return props.transit
        ? <>

            <MDBContainer>
                <MDBModal isOpen={infoOpen} toggle={() => setInfoOpen(false)}>
                    <MDBModalHeader toggle={() => setInfoOpen(false)}>
                        {'#' + good.id}
                    </MDBModalHeader>
                    <MDBModalBody>
                        {[
                            {label: 'Наименование', value: good.model},
                            {label: 'Откуда', value: good.stock},
                            {label: 'Идентификатор', value: good.imei},
                            {label: 'Время передачи в транзит', value: good.outtime},
                            {label: 'Ответственный', value: good.user},
                        ].map(f => f.value
                            ? <TextField
                                key={uuidv4()}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                }}
                                label={f.label}
                                value={f.value}
                            />
                            : '')}
                    </MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color="secondary" onClick={() => setInfoOpen(false)}>
                            Отмена
                        </MDBBtn>
                        {props.current_stock_id
                            ? <MDBBtn color="primary" onClick={_ => fromTransit(_, good)}>
                                Принять
                            </MDBBtn>
                            : ''}
                    </MDBModalFooter>
                </MDBModal>
            </MDBContainer>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                #
                            </TableCell>
                            <TableCell>
                                Категория
                            </TableCell>
                            <TableCell>
                                Наименование
                            </TableCell>
                            <TableCell>
                                откуда
                            </TableCell>
                            {!!props.current_stock_id && <TableCell/>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.transit.map(good => {

                            good.id = +good.barcode.toString().substring(6, 12)
                            let stock = props.stocks.find(st => st.id === good.stock_id)
                            let user = props.users.find(u => u.id === good.responsible_id)
                            let category = props.categories.find(c => c.id === good.category_id)

                            good.c = ''

                            good.stock = stock
                                ? stock.name
                                : ''

                            good.user = user
                                ? user.name
                                : ''

                            good.category = category
                                ? category.name
                                : 'нет'

                            return (<TableRow
                                key={uuidv4()}
                                className={good.c}
                                onClick={e => getInfo(good, e.target)}
                                style={{cursor: 'pointer'}}
                            >
                                <TableCell>
                                    {good.id}
                                </TableCell>
                                <TableCell>
                                    {good.category}
                                </TableCell>
                                <TableCell>
                                    {good.model}
                                </TableCell>
                                <TableCell>
                                    {good.stock}
                                </TableCell>
                                {!!props.current_stock_id && <TableCell>
                                    <Tooltip title="Принять">
                                        <IconButton
                                            style={{padding: '0.2rem'}}
                                            onClick={e => fromTransit(e, good)}
                                        >
                                            <CheckIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>}
                            </TableRow>)
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

        </>
        : <h5>Загружаем данные...</h5>
}

export default connect(state => (state.app))(Transit);