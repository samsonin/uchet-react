import React, { Component } from 'react';
import { bindActionCreators } from "redux";
import { closeSnackbar, enqueueSnackbar, upd_app } from "../actions/actionCreator";
import { connect } from "react-redux";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import PrintIcon from '@material-ui/icons/Print';
import AddIcon from '@material-ui/icons/Add';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import request from "./Request";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";
import { Paper } from "@material-ui/core";

const mapDispatchToProps = dispatch => bindActionCreators({
    enqueueSnackbar,
    closeSnackbar,
    upd_app
}, dispatch);

// const indexes = ['customer', 'good', 'remont'];
const indexes = ['customer', 'remont'];
const initialState = {
    // elements: {},
    customerId: 0,
    currentValues: {
        remont: {
            group: 1,
            master_id: 0,
        },
    },
    isPrinted: false
};

export default connect(state => (state), mapDispatchToProps)(class extends Component {

    state = initialState;

    // componentWillUpdate(nextProps, nextState) {
    //     console.log('nextState', nextState)
    // }

    newOrder() {

        let form = document.getElementById('newOrderForm');
        let elements = [];

        for (var i = 0; i < form.elements.length - 1; i++) {
            elements[i] = {name: form.elements[i].name, value: form.elements[i].value}
        }


        request({
            action: 'new',
            stock_id: this.props.app.stock_id,
            elements
        }, '/order', this.props.auth.jwt)
            .then(data => {

                console.log(data);

                if (data.result) {

                    this.setState({isPrinted: true})

                    window.print();

                }
            })

    }

    valuesHandle(index, name, newValue) {
        let newState = this.state;
        if (newState.currentValues[index] === undefined) {
            newState.currentValues[index] = {};
        }
        newState.currentValues[index][name] = newValue;
        this.setState(newState)
    }

    findCustomer() {
        console.log('findCustomer');
    }

    render() {

        if (this.props.app.stock_id === undefined) return <h3>Выберите точку</h3>;
        if (this.props.app.fields === undefined || this.props.app.fields.allElements === undefined) return <h5>Загружаем данные...</h5>

        if (this.state.isPrinted) {

            let html = this.props.app.docs.docs[0].doc_text;

            return (
                <div>

                    <Grid container>
                        <Grid item xs={12} className="d-print-none text-center">
                            <IconButton className="p-2 m-2" onClick={() => window.print()}>
                                <PrintIcon/>
                            </IconButton>
                            <IconButton className="p-2 m-2" onClick={() => this.setState(initialState)}>
                                <AddIcon/>
                            </IconButton>
                            <IconButton className="p-2 m-2" onClick={() => this.setState({isPrinted: false})}>
                                <ArrowBackIcon/>
                            </IconButton>
                        </Grid>
                    </Grid>

                    <Paper className="p-2">
                        <div dangerouslySetInnerHTML={{__html: html}}/>
                    </Paper>

                </div>
            );

        } else {

            let arr = [];

            indexes.map(index => {

                arr.push(<>
                    <h5 key={"eleavqermh5asdcasc" + index}>
                    {this.props.app.fields.alliases[index]}
                </h5>
                    {index === 'customer' ?
                        this.state.customerId === 0 ?
                            <Button variant="outlined" color="primary" onClick={() => this.findCustomer()}>
                                Выбрать из базы...
                            </Button>
                            : <h5>{this.state.customerId}</h5>
                        : ''}
                </>);
                this.props.app.fields.allElements[index].map(v => {

                    if (v.isValid && !v.isOnlySystem) {
                        if (v.isSystem) {
                            if (v.name === 'cost') {
                                arr.push(<TextField
                                    name={index + '_' + v.name}
                                    type="number"
                                    defaultValue={this.props.app.config.rem_assessed_value}
                                    key={"eleavqaefweerm" + index + v.name}
                                    className={"m-2 p-2 w-100"}
                                    label={"себестоимость"}
                                    onChange={(e) => console.log(e.target.value)}
                                />)
                            } else if (v.name === 'sum2') {
                            } else if (v.name === 'master_id') {
                                arr.push(<FormControl className={"m-2 p-2 w-100"} key="ekuvgwelrvjhb">
                                    <InputLabel>Мастер</InputLabel>
                                    <Select
                                        name={index + '_' + v.name}
                                        value={this.state.currentValues.remont.master_id}
                                        onChange={(e) => this.valuesHandle(index, v.name, e.target.value)}
                                    >
                                        <MenuItem value={0} key={"ordermasterselitemhieurvneiu0"}><br/></MenuItem>
                                        {this.props.app.users.map(v => {
                                             if (v.isValid) return <MenuItem
                                                    value={v.id} key={"ordermasterselitemhieurvneiu" + v.id}>
                                                    {v.name}
                                                </MenuItem>;
                                            }
                                        )}
                                    </Select>
                                </FormControl>)
                            } else if (v.name === 'prepaid') {
                                arr.push(<TextField
                                    name={index + '_' + v.name}
                                    type="number"
                                    defaultValue={0}
                                    key={"eleavqaefweerm" + index + v.name}
                                    className={"m-2 p-2 w-100"}
                                    label={"предоплата"}
                                    onChange={(e) => this.valuesHandle(index, v.name, e.target.value)}
                                />)
                            } else if (v.name === 'birthday' || v.name === 'doc_date') {
                                arr.push(<TextField
                                    name={index + '_' + v.name}
                                    type="date"
                                    defaultValue={'1970-01-01'} // (\d+|\d+\.\d+|\.\d+)([eE][-+]?\d+)?
                                    key={"eleavqaefweerm" + index + v.name}
                                    className={"m-2 p-2 w-100"}
                                    label={v.value}
                                    onChange={(e) => this.valuesHandle(index, v.name, e.target.value)}
                                />)
                            } else {

                                console.log('index', index)
                                console.log('name', v.name)

                                arr.push(<TextField
                                    name={index + '_' + v.name}
                                    key={"eleavqaefweerm" + index + v.name}
                                    className={"m-2 p-2 w-100"}
                                    label={v.value}
                                    onChange={(e) => this.valuesHandle(index, v.name, e.target.value)}
                                />)
                            }

                            // console.log(index, v)

                        } else {
                            arr.push(<TextField
                                name={index + '_' + v.name}
                                key={"eleavqaefweerm" + index + v.name}
                                className={"m-2 p-2 w-100"}
                                label={v.value}
                                onChange={(e) => console.log(e.target.value)}
                            />)
                        }
                    }
                });

            });

            return <form id="newOrderForm" onSubmit={(e) => {
                e.preventDefault();
                this.newOrder();
            }}>
                {arr}
                <Button variant="contained" color="primary" onClick={() => this.newOrder()}>
                    Создать заказ
                </Button>
            </form>

        }
    }

});
