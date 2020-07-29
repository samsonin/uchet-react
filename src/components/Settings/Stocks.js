import React from "react";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {closeSnackbar, enqueueSnackbar, upd_app} from "../../actions/actionCreator";

import {Fab, FormControlLabel, Grid, InputLabel, Switch, TextField, Typography} from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import IconButton from "@material-ui/core/IconButton";

import rest from '../../components/Rest';

// TODO избавиться от classname и переписать используя @material-ui
// сократить и оптимизировать код
// пожалуйста, работайте в отдельной ветке гита


const mapDispatchToProps = dispatch => bindActionCreators({
    enqueueSnackbar,
    closeSnackbar,
    upd_app
}, dispatch);

function Stocks(props) {

    const [isRequest, setIsRequest] = React.useState(false);

    const add = () => {

        if (props.app.stocks.find(point => point.name === '')) {
            props.enqueueSnackbar({
                message: 'Существует точка без названия, создать новую невозможно!',
                options: {
                    variant: 'warning',
                }
            });
        } else {

            if (!isRequest) {
                setIsRequest(true);
                rest('stocks', 'POST', {})
                    .then(data => {

                        setIsRequest(false);
                        if (data.result) {
                            const {upd_app} = props;
                            upd_app({stocks: data.stocks})
                        }
                    });
            }
        }
    }

    const renderFab = () => <Fab color="primary" aria-label="add" className="addfab" onClick={add}>
        <AddIcon/>
    </Fab>

    const requestSettings = (id, index, value) => {

        if (value === '') return false;

        if (!isRequest) {
            setIsRequest(true);
            rest({
                action: 'changePoint',
                id,
                index,
                value
            }, '/settings', props.auth.jwt)
                .then(data => {

                    setIsRequest(false);
                    if (data.result) {

                        const {upd_app} = props;
                        upd_app({stocks: data.stocks})

                    } else {
                        let message = 'ошибка';
                        if (data.error === 'already_used') message = 'Такой пользователь уже зарегистрирован!';
                        if (data.error === 'wrong_format') message = 'Неправильный формат контакта!';
                        props.enqueueSnackbar({
                            message,
                            options: {
                                variant: 'warning',
                            }
                        });
                    }
                })
        }
    };

    return props.app.stocks.map(v => {
        return <div key={"grKeydiv" + v.id}>
            <Grid container direction="row" className="hoverable m-2 p-3" key={"grKey" + v.id}>
                <Grid item xs={9}>
                    <Typography variant="h3">
                        <i className="fas fa-store"/>
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <FormControlLabel
                        label={v.is_valid ? 'Активна' : 'Не активна'}
                        control={
                            <Switch checked={!!v.is_valid}
                                    onChange={e => requestSettings(v.id, 'is_valid', e.target.checked)}
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
                        defaultValue={v.name} className="w-75"
                        onBlur={e => requestSettings(v.id, 'name', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <InputLabel className="mt-2 font-weight-bold">Адрес:</InputLabel>
                    <TextField
                        defaultValue={v.address} className="w-75"
                        onBlur={(e) => requestSettings(v.id, 'address', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <InputLabel className="mt-2 font-weight-bold">Телефон:</InputLabel>
                    <TextField
                        defaultValue={v.phone_number} className="w-75"
                        onBlur={e => requestSettings(v.id, 'phone_number', e.target.value)}
                    />
                </Grid>
            </Grid>
            {renderFab()}
        </div>
    })

}

export default connect(state => (state), mapDispatchToProps)(Stocks)
