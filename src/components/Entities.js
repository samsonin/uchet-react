import React, {useState} from 'react';
import {connect} from "react-redux";

import TableContainer from "@mui/material/TableContainer";
import {Paper} from "@mui/material";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from '@mui/icons-material/Search';
import TableBody from "@mui/material/TableBody";
import Tooltip from "@mui/material/Tooltip";
import {Link} from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import EditIcon from '@mui/icons-material/Edit';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AddCircleIcon from "@mui/icons-material/AddCircle";

const toLowerSafe = value => String(value || '').toLowerCase();

const Entities = ({providers}) => {

    const [search, setSearch] = useState('');

    return <Grid>
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <Typography variant="h5">
                                Юр. лица
                            </Typography>
                        </TableCell>
                        <TableCell colSpan={3}>
                            <Input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <SearchIcon/>
                                    </InputAdornment>
                                }/>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>Наименование</TableCell>
                        <TableCell>ИНН</TableCell>
                        <TableCell/>
                        <TableCell>
                            <Tooltip title="Добавить">
                                <Link to="/entities/0">
                                    <IconButton>
                                        <AddCircleIcon/>
                                    </IconButton>
                                </Link>
                            </Tooltip>
                        </TableCell>
                    </TableRow>

                    {providers.filter(p => {

                        if (!search) return true

                        const name = toLowerSafe(p.name)

                        let r = true

                        search.toLowerCase()
                            .split(' ')
                            .map(s => {

                                if (name.indexOf(s) < 0) {
                                    r = false
                                }

                            })

                        return r

                    })
                        .map(p => p.is_valid
                            ? <TableRow
                                key={'entitiesrowkey' + p.id}
                            >
                                <TableCell>
                                    {p.name}
                                </TableCell>
                                <TableCell>
                                    {p.inn}
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="Редактировать">
                                        <Link to={"/entities/" + p.id}>
                                            <IconButton>
                                                <EditIcon/>
                                            </IconButton>
                                        </Link>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="Взаиморасчеты">
                                        {/*<Link to={"/entities/" + p.id}>*/}
                                        <IconButton>
                                            <ReceiptIcon/>
                                        </IconButton>
                                        {/*</Link>*/}
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                            : null
                        )}
                </TableBody>
            </Table>
        </TableContainer>
    </Grid>

}

export default connect(state => state.app)(Entities);
