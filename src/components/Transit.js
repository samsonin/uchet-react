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

import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import IconButton from "@material-ui/core/IconButton";
import CheckIcon from '@material-ui/icons/Check';
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import {MDBBtn, MDBContainer, MDBModal, MDBModalBody, MDBModalFooter, MDBModalHeader} from "mdbreact";
import TextField from "@material-ui/core/TextField/TextField";
import {bindActionCreators} from "redux";
import {upd_app} from "../actions/actionCreator";
import {useSnackbar} from "notistack";

const mapDispatchToProps = dispatch => bindActionCreators({
    upd_app
}, dispatch);


const Transit = props => {

    const [infoOpen, setInfoOpen] = useState(false)

    const [good, setGood] = useState({})

    const getInfo = good => {

        setGood(good)
        setInfoOpen(true)

    }

    const {enqueueSnackbar} = useSnackbar()

    useEffect(() => {

        if (!props.newScan) return

        rest('transit/' + props.stock_id + '/' + props.newScan, 'PATCH')
            .then(res => {

                if (res.status === 200) {

                    enqueueSnackbar('ok', {variant: 'success'})

                }

            })

    }, [props.newScan])

    const fromTransit = (e, good) => {

        let tr = e.target.closest('tr')
        if (tr) tr.classList.add('transition-hidden')

        rest('transit/' + props.stock_id + '/' + good.barcode, 'DELETE')
            .then(res => {

                if (res.status === 200) {

                    props.upd_app(res.body)

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
                                key={'keyinmapgoodmodaltransit' + f.label}
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
                        {props.stock_id
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
                                Наименование
                            </TableCell>
                            <TableCell>
                                откуда
                            </TableCell>
                            <TableCell>
                                действия
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.transit.map(good => {

                            good.id = +good.barcode.toString().substr(6, 6)
                            let stock = props.stocks.find(st => st.id === good.stock_id)
                            let user = props.users.find(u => u.id === good.responsible_id)

                            good.c = ''

                            good.stock = stock
                                ? stock.name
                                : ''

                            good.user = user
                                ? user.name
                                : ''

                            return <TableRow
                                key={'tablerowintransitkey' + good.barcode}
                                className={good.c}
                            >
                                <TableCell>
                                    {good.id}
                                </TableCell>
                                <TableCell>
                                    {good.model}
                                </TableCell>
                                <TableCell>
                                    {good.stock}
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="Информация">
                                        <IconButton
                                            style={{padding: '0.2rem'}}
                                            onClick={() => getInfo(good)}
                                        >
                                            <InfoOutlinedIcon/>
                                        </IconButton>
                                    </Tooltip>
                                    {props.stock_id
                                        ? <Tooltip title="Принять">
                                            <IconButton
                                                style={{padding: '0.2rem'}}
                                                onClick={e => fromTransit(e, good)}
                                            >
                                                <CheckIcon/>
                                            </IconButton>
                                        </Tooltip>
                                        : ''}
                                </TableCell>
                            </TableRow>
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
        : <h5>Загружаем данные...</h5>

}

export default connect(state => (state.app), mapDispatchToProps)(Transit);