import React from "react";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {upd_app} from "../../actions/actionCreator";

import {useSnackbar} from 'notistack';

import {Fab, FormControlLabel, Grid, InputLabel, Switch, TextField, Typography} from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';

import rest from '../../components/Rest';

// TODO избавиться от classname и переписать используя @material-ui
// сократить и оптимизировать код
// пожалуйста, работайте в отдельной ветке гита

const mapDispatchToProps = dispatch => bindActionCreators({upd_app}, dispatch);

const Stocks = props => {

    const [isRequest, setIsRequest] = React.useState(false);

    const {enqueueSnackbar} = useSnackbar();

    const add = () => {

        if (props.app.stocks.find(point => point.name === '')) {
            enqueueSnackbar('Существует точка без названия, создать новую невозможно!', {
                variant: 'warning'
            })
        } else {

            if (!isRequest) {
                setIsRequest(true);
                rest('stocks', 'POST')
                    .then(res => {

                        setIsRequest(false);
                        if (res.result) {
                            const {upd_app} = props;
                            upd_app(res.body)
                        }
                    });
            }
        }
    }

    const requestSettings = (id, index, value) => {

        if (!value) return false;

        if (!isRequest) {
            setIsRequest(true);
            rest('stocks/' + id, 'PATCH', {
                [index]: value
            })
                .then(data => {

                    setIsRequest(false);

                    if (data.result) {

                        const {upd_app} = props;
                        upd_app({stocks: data.stocks})

                    } else {

                        // let message = 'ошибка';
                        // if (data.error === 'already_used') message = 'Такой пользователь уже зарегистрирован!';
                        // else if (data.error === 'wrong_format') message = 'Неправильный формат контакта!';
                        // enqueueSnackbar(message, {
                        //     variant: 'warning'
                        // })

                    }

                })
        }
    };

    return <>
        {props.app.stocks.map(stock => <div key={"grKeydiv" + stock.id}>
                <Grid container direction="row" className="hoverable m-2 p-3" key={"grKey" + stock.id}>
                    <Grid item xs={9}>
                        <Typography variant="h3">
                            <i className="fas fa-store"/>
                        </Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <FormControlLabel
                            label={stock.is_valid ? 'Активна' : 'Не активна'}
                            control={
                                <Switch checked={!!stock.is_valid}
                                        onChange={e => requestSettings(stock.id, 'is_valid', e.target.checked)}
                                        color="primary"/>
                            }
                        />
                        {/*{!v.is_valid && v.canDelete ?*/}
                        {/*    <IconButton color="secondary" onClick={() => this.deletePoint(v.id)}>*/}
                        {/*        <DeleteIcon/>*/}
                        {/*    </IconButton>*/}
                        {/*: ''}*/}
                    </Grid>
                    <Grid item xs={12}>
                        <InputLabel className="mt-2 font-weight-bold">Название:</InputLabel>
                        <TextField
                            defaultValue={stock.name} className="w-75"
                            onBlur={e => requestSettings(stock.id, 'name', e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <InputLabel className="mt-2 font-weight-bold">Адрес:</InputLabel>
                        <TextField
                            defaultValue={stock.address} className="w-75"
                            onBlur={(e) => requestSettings(stock.id, 'address', e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <InputLabel className="mt-2 font-weight-bold">Телефон:</InputLabel>
                        <TextField
                            defaultValue={stock.phone_number} className="w-75"
                            onBlur={e => requestSettings(stock.id, 'phone_number', e.target.value)}
                        />
                    </Grid>
                </Grid>
            </div>
        )}
        <Fab color="primary" aria-label="add" className="addfab" onClick={add}>
            <AddIcon/>
        </Fab>
    </>

}

export default connect(state => (state), mapDispatchToProps)(Stocks)
