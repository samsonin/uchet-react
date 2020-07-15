import React, {Component} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {closeSnackbar, enqueueSnackbar, upd_app} from "../actions/actionCreator";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";


const mapDispatchToProps = dispatch => bindActionCreators({
    enqueueSnackbar,
    closeSnackbar,
    upd_app
}, dispatch);

export default connect(state => (state), mapDispatchToProps)(class extends Component {

    state = {
        stocks: [],
        orders: {
            id: 0,
            masterId: 0,
            status_ids: [],
            dateOfCreated: '',
            dateOfCreated2: '',
            dateOfCheckout: '',
            dateOfCheckout2: '',
        },
        goods: {
            caterogyId: 0,
            model: '',
            imei: '',
        },
        customers: {
            fio: '',
            phoneNumber: '',
        },
    }

    handleStocks = (stockId, checked) => {
        let stocks = this.state.stocks;
        stocks[stockId] = checked;
        this.setState({stocks})
    }

    handleOrder = (i, val) => {

        if (i === 'id' && val < 0) val = 0;
        let orders = this.state.orders;
        orders[i] = val;
        this.setState({orders})

    }

    render() {

        return <Grid container>
            <Grid item>

                {this.props.app.stocks.map(v => {
                    return v.is_valid ?
                        <FormControlLabel
                            control={<Checkbox
                                color="primary"
                                key={'stocksonordersseach' + v.id}
                                checked={this.state.stocks[v.id] === undefined ? true : this.state.stocks[v.id]}
                                onChange={e => this.handleStocks(v.id, e.target.checked)}
                            />}
                            label={v.name}
                        /> : ''
                })}

            </Grid>
            <Grid item>

                <TextField
                    type="number"
                    key={"idonordersseach"}
                    className={"m-2 p-2 w-100"}
                    label={"Заказ"}
                    onChange={e => this.handleOrder('id', e.target.value)}
                />

            </Grid>
            <Grid item>
                Заказ создан с
                <TextField
                    type="date"
                    className={"m-2 p-2"}
                    value={this.state.orders.dateOfCreated}
                    onChange={e => this.handleOrder('dateOfCreated', e.target.value)}
                />
                по
                <TextField
                    type="date"
                    className={"m-2 p-2"}
                    value={this.state.orders.dateOfCreated2}
                    onChange={e => this.handleOrder('dateOfCreated2', e.target.value)}
                />
            </Grid>
            <Grid item>
                Заказ закрыт с
                <TextField
                    type="date"
                    className={"m-2 p-2"}
                    value={this.state.orders.dateOfCheckout}
                    onChange={e => this.handleOrder('dateOfCheckout', e.target.value)}
                />
                по
                <TextField
                    type="date"
                    className={"m-2 p-2"}
                    value={this.state.orders.dateOfCheckout2}
                    onChange={e => this.handleOrder('dateOfCheckout2', e.target.value)}
                />
            </Grid>
        </Grid>

    }

});