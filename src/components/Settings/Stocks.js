import React from "react";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {upd_app} from "../../actions/actionCreator";

import {useSnackbar} from 'notistack';

import {Fab, FormControlLabel, Grid, InputLabel, Paper, Switch, TextField, Typography} from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';

import rest from '../../components/Rest';
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import {Link} from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from "@material-ui/icons/Edit";
import TableCell from "@material-ui/core/TableCell";
import {makeStyles} from "@material-ui/core/styles";
import AddCircleIcon from "@material-ui/icons/AddCircle";

// TODO избавиться от classname и переписать используя @material-ui
// сократить и оптимизировать код
// пожалуйста, работайте в отдельной ветке гита

const mapDispatchToProps = dispatch => bindActionCreators({upd_app}, dispatch);

const useStyles = makeStyles({
    title: {
        width: '80%',
        marginTop: '0.4rem',
    },
    icon: {
        width: '10%',
        marginTop: '0.5rem',
    },
    name: {
        width: '80%',
        marginTop: '0.8rem',
        alignContent: 'center',
        cursor: 'pointer',
    },
    switch: {
        width: '10%',
        marginTop: '0.3rem',
    },
})

const Stocks = props => {

    const [isRequest, setIsRequest] = React.useState(false);

    const {enqueueSnackbar} = useSnackbar();

    const classes = useStyles();

    const add = () => {

        if (!isRequest) {
            setIsRequest(true);
            rest('stocks', 'POST')
                .then(res => {

                    setIsRequest(false);
                    if (res.status < 300) {
                        const {upd_app} = props;
                        upd_app(res.body)

                        enqueueSnackbar('ok', {variant: 'success'})
                    }
                });
        }
    }

    const isValidToggleHandler = (id, value) => {

        if (!isRequest) {

            setIsRequest(true);
            rest('stocks/' + id, 'PATCH', {
                is_valid: value
            })
                .then(res => {

                    setIsRequest(false);

                    if (res.status < 300) {

                        const {upd_app} = props;
                        upd_app(res.body)

                        enqueueSnackbar('ok', {variant: 'success'})

                    } else {

                        enqueueSnackbar('error', {variant: 'error'})

                    }

                })
        }
    };

    return <Grid container
                 component={Paper}
                 justify="space-around"
    >
        <Grid container
              style={{padding: '1rem'}}
              justify="flex-end"
        >
            <Grid item className={classes.title}>
                <Typography variant="h5">
                    Точки
                </Typography>
            </Grid>
            <Grid item>
                <Tooltip title="Добавить">
                    <IconButton onClick={add}
                                disabled={isRequest}
                    >
                        <AddCircleIcon/>
                    </IconButton>
                </Tooltip>
            </Grid>

        </Grid>

        {props.app.stocks.map(stock => <Grid container
                                             className={"hoverable"}
                                             onClick={() => props.history.push('/settings/stocks/' + stock.id)}
                                             style={{padding: '1rem'}}
                                             key={"conteinerinstockgrid" + stock.id}
            >
                    <Grid item
                          className={classes.icon}
                    >
                        <Typography variant="h6">
                            <i className="fas fa-store"/>
                        </Typography>
                    </Grid>
                    <Grid item
                          className={classes.name}
                    >
                        <Typography variant="subtitle1">
                            {stock.name}
                        </Typography>
                    </Grid>
                    <Grid item
                          className={classes.switch}
                    >
                        <Tooltip title={stock.is_valid
                            ? "Отключить"
                            : "Включить"}
                        >
                            <FormControlLabel
                                control={
                                    <Switch checked={!!stock.is_valid}
                                            disabled={isRequest}
                                            onChange={e => isValidToggleHandler(stock.id, e.target.checked)}
                                            color="primary"/>
                                }
                            />
                        </Tooltip>
                    </Grid>

            </Grid>
        )}
    </Grid>

}

export default connect(state => (state), mapDispatchToProps)(Stocks)
