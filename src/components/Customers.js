import React from 'react';
import Typography from "@material-ui/core/Typography";
import {Paper} from "@material-ui/core";
import TableContainer from "@material-ui/core/TableContainer";
import restRequest from "./Rest";

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


let request = false;

export default class extends React.Component {

    state = {
        searchStr: '',
    }

    componentDidMount() {

        request = true;
        restRequest('customers')
            .then(res => {
                if (res.ok) this.setState({customers: res.body});
                request = false;
            })

    }

    handleSearch(v) {
        this.setState({searchStr: v})

        if (!request) {
            request = true;

            restRequest('customers?all=' + v)
                .then(res => {
                    if (res.ok) this.setState({customers: res.body});
                    request = false;
                    if (this.state.searchStr !== v) this.handleSearch(this.state.searchStr)
                })
        }
    }

    renderBody() {

        return this.state.customers ?

            this.state.customers.map(c => {

                return this.state.searchStr === '' ||
                (c.fio.indexOf(this.state.searchStr) > -1) ||
                (c.phone_number.indexOf(this.state.searchStr) > -1) ?

                    <TableRow key={'teblerowcust' + c.id}>
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
                    </TableRow> : ''
            }) :
            <TableRow>
                <TableCell colSpan={3}>
                    Загружаем данные...
                </TableCell>
            </TableRow>

    }

    render() {
        return <Grid conteiner>
            <Grid item>
                <Typography variant="h4" align="center">Физические лица</Typography>
            </Grid>
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
                                        onChange={e => this.handleSearch(e.target.value)}
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

                            {this.renderBody()}

                        </TableBody>
                    </Table>
                </TableContainer>
                {/*<Typography variant="h5" style={{margin: 25}}>*/}
                {/*    Загружаем данные...*/}
                {/*</Typography>*/}

            </ Grid>
        </Grid>
    }
}
