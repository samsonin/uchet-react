import React, {useState} from 'react';
import {connect} from "react-redux";

import TableContainer from "@material-ui/core/TableContainer";
import {Paper} from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Input from "@material-ui/core/Input/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from '@material-ui/icons/Search';
import TableBody from "@material-ui/core/TableBody";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import {Link} from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from '@material-ui/icons/Edit';
import ReceiptIcon from '@material-ui/icons/Receipt';
import AddCircleIcon from "@material-ui/icons/AddCircle";

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

                    {providers.filter(p => p.name.toLowerCase().indexOf(search.toLowerCase()) >= 0)
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
