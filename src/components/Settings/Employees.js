import React, {useState} from "react";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {
    closeSnackbar,
    enqueueSnackbar,
    upd_app,
} from "../../actions/actionCreator";

import {
    Fab,
    FormControlLabel,
    Grid,
    IconButton,
    Switch,
    TextField,
    Typography,
} from "@material-ui/core";
import PersonIcon from "@material-ui/icons/Person";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from "@material-ui/icons/Add";
import {makeStyles} from "@material-ui/core/styles";

import request from '../Request'
import AuthControl from '../../components/AuthControl';
import InputAdornment from "@material-ui/core/InputAdornment";

let authControl = new AuthControl();

const useStyles = makeStyles({
    fab: {
        position: "fixed !important",
        zIndex: 2000,
        bottom: "5% !important",
    },
    ml45: {
        marginLeft: "45% !important",
    },
    ml35: {
        marginLeft: "35% !important",
    },
    hoverGrid: {
        boxShadow: "none",
        transition: "all 0.55s ease-in-out",
        margin: ".5rem",
        padding: ".5rem",
        "&:hover, &:focus": {
            boxShadow:
                "0 8px 17px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
            transition: "all 0.55s ease-in-out",
        },
    },
});
const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            enqueueSnackbar,
            closeSnackbar,
            upd_app,
        },
        dispatch
    );

const Employees = props => {

    const [isRequest, setRequest] = useState(false);
    const [status, setStatus] = useState(0)
    const [isEndAdornment, setEndAdornment] = useState(false)

    const requestSettings = (action, value, id, index,) => {

        if (isRequest) return false;
        if (action === 'changeEmployee' && value === '') return false;

        setRequest(true);

        request({
            action,
            id,
            index,
            value
        }, '/settings', props.auth.jwt)
            .then(data => {

                setRequest(false);

                if (data.result) {

                    setStatus(0)

                    const {upd_app} = props;
                    upd_app({users: data.users})

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
    };


    const validateWait = () => {
        if (authControl.isValid("#add-employee")) {

            let isvalid = authControl.validate_phone_number("#add-employee")
                || authControl.validate_email("#add-employee")

            console.log(isvalid)

            setEndAdornment (isvalid)
        }
    }

    const add = () => {

        request({action: 'addEmployee'}, '/settings', props.auth.jwt)
            .then(data => {

                if (data.result) {
                    const {upd_app} = props;
                    upd_app({users: data.users})

                }

            })
    }

    const classes = useStyles();

    const renderInput = () => <div>
        <TextField
            id="add-employee"
            className={`${classes.fab} ${classes.ml45}`}
            variant="outlined"
            label="Контакт сотрудника"
            onChange={validateWait}
            InputProps={{
                endAdornment: <InputAdornment position="end">
                    <IconButton
                        disabled={!isEndAdornment}
                        onClick={() => requestSettings(
                            "addEmployee",
                            document.getElementById("add-employee").value
                        )}
                    >
                        <AddIcon/>
                    </IconButton>
                </InputAdornment>
            }}
        />
    </div>

    const renderFab = () => <Fab
        color="primary"
        aria-label="add"
        className={`${classes.fab} ${classes.ml45}`}
        onClick={() => setStatus(1)}
    >
        <PersonAddIcon size="large"/>
    </Fab>

    return <>
        {props.app.users.map(v => <Grid
            container
            direction="row"
            className={classes.hoverGrid}
            key={"grusKey" + v.id + v.verified_contact}
        > {typeof v.verified_contact === "string"
            ? <>
                <Grid item xs={9}>
                    <Typography variant="subtitle1" style={{color: "gray"}}>
                        Ждет подтверждения:
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <IconButton
                        color="secondary"
                        onClick={() =>
                            requestSettings("deleteWait", v.verified_contact)
                        }
                    >
                        <DeleteIcon />
                    </IconButton>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        defaultValue={v.verified_contact}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </Grid>
            </>
            : <>
                <Grid item xs={6}>
                    <PersonIcon style={{fontSize: "4rem"}}/>
                </Grid>
                <Grid item xs={6}>
                    <FormControlLabel
                        label={v.is_valid ? "Работает" : "Уволен"}
                        control={
                            <Switch
                                checked={!!v.is_valid}
                                onChange={(e) =>
                                    requestSettings(
                                        "changeEmployee",
                                        e.target.checked,
                                        v.id,
                                        "is_valid",
                                    )
                                }
                                color="primary"
                            />
                        }
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" style={{color: "gray"}}>
                        Имя:
                    </Typography>
                    <TextField
                        defaultValue={v.name}
                        fullWidth={true}
                        onBlur={(e) =>
                            requestSettings("changeEmployee", e.target.value, v.id, "user")
                        }
                    />
                </Grid>
            </>}

        </Grid>)}
        {status === 1
            ? renderInput()
            : renderFab()
        }
    </>
}

export default connect((state) => state, mapDispatchToProps)(Employees);
