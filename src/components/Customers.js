import React, {useEffect, useRef, useState} from 'react';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import TableBody from "@mui/material/TableBody";
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";
import Input from "@mui/material/Input";
import {Link} from "react-router-dom";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {Paper} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";

import rest from "./Rest";

const toLowerSafe = value => String(value || '').toLowerCase();

export default function (props) {

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

        ? customers.filter(c => {

                if (!search) return true

                const fio = toLowerSafe(c.fio)
                const pn = toLowerSafe(c.phone_number)

                let r = true

                search.toLowerCase()
                    .split(' ')
                    .map(s => {

                        if (fio.indexOf(s) < 0 && pn.indexOf(s) < 0) {
                            r = false
                        }

                    })

                return r

            })
            .map(c => <TableRow
                key={'teblerowcust' + c.id}
                onClick={() => props.history.push('/customers/' + c.id)}
                style={{
                    cursor: 'pointer'
                }}
            >
                <TableCell>{c.fio}</TableCell>
                <TableCell>{c.phone_number}</TableCell>
            </TableRow>)

        : <TableRow>
            <TableCell colSpan={3}>
                Загружаем данные...
            </TableCell>
        </TableRow>

    return <Grid container sx={{ width: '100%' }}>
        <Grid size={12}>
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
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}>
                                    <Input
                                        id={'searchCustomerString'}
                                        name={'searchCustomerString'}
                                        onChange={e => handleSearch(e.target.value)}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <SearchIcon/>
                                            </InputAdornment>
                                        }/>
                                    <Tooltip title="Добавить">
                                        <Link to="/customers/0">
                                            <IconButton>
                                                <AddCircleIcon/>
                                            </IconButton>
                                        </Link>
                                    </Tooltip>
                                </div>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>ФИО</TableCell>
                            <TableCell>Номер телефона</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        {renderBody()}

                    </TableBody>
                </Table>
            </TableContainer>

        </Grid>
    </Grid>

}
