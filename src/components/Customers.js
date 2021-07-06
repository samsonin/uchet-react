import React, {useEffect, useRef, useState} from 'react';

import EditIcon from '@material-ui/icons/Edit';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import SearchIcon from '@material-ui/icons/Search';
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import IconButton from "@material-ui/core/IconButton";
import TableBody from "@material-ui/core/TableBody";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import InputAdornment from "@material-ui/core/InputAdornment";
import Input from "@material-ui/core/Input";
import {Link} from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import {Paper} from "@material-ui/core";
import TableContainer from "@material-ui/core/TableContainer";

import rest from "./Rest";

export default function () {

    const [search, setSearch] = useState('')
    const [customers, setCustomers] = useState()

    const request = useRef(false)

    useEffect(() => {

        request.current = true;
        rest('customers')
            .then(res => {
                if (res.ok) setCustomers(res.body)
                request.current = false;
            })

    }, [])

    const handleSearch = v => {

        setSearch(v)

        if (!request.current) {
            request.current = true;

            rest('customers?all=' + v)
                .then(res => {
                    if (res.ok) setCustomers(res.body);
                    request.current = false;
                })
        }
    }

    const renderBody = () => customers

        ? customers.map(c => search === '' ||
        (c.fio.indexOf(search) > -1) ||
        (c.phone_number.indexOf(search) > -1)

            ? <TableRow key={'teblerowcust' + c.id}>
                <TableCell>{c.fio}</TableCell>
                <TableCell>{c.phone_number}</TableCell>
                <TableCell>
                    <Tooltip title="Редактировать">
                        <Link to={"/customers/" + c.id}>
                            <IconButton>
                                <EditIcon/>
                            </IconButton>
                        </Link>
                    </Tooltip>
                </TableCell>
            </TableRow>
            : '')
        : <TableRow>
            <TableCell colSpan={3}>
                Загружаем данные...
            </TableCell>
        </TableRow>


    return <Grid container>
        <Grid item>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell style={{weight: '40%'}}>
                                <Typography variant="h5">
                                    Физ. лица
                                </Typography>
                            </TableCell>
                            <TableCell colSpan={2}>
                                <Input
                                    onChange={e => handleSearch(e.target.value)}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <SearchIcon/>
                                        </InputAdornment>
                                    }/>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>ФИО</TableCell>
                            <TableCell>Номер телефона</TableCell>
                            <TableCell>
                                <Tooltip title="Добавить">
                                    <Link to="/customers/0">
                                        <IconButton>
                                            <AddCircleIcon/>
                                        </IconButton>
                                    </Link>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        {renderBody()}

                    </TableBody>
                </Table>
            </TableContainer>

        </ Grid>
    </Grid>

}
