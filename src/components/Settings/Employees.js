import React, {useState} from "react";
import {connect} from "react-redux";

import {
    Fab,
    FormControlLabel,
    Grid,
    IconButton,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from "@mui/icons-material/Add";
import {makeStyles} from "muiLegacyStyles";
import InputAdornment from "@mui/material/InputAdornment";

import {useSnackbar} from 'notistack';

import request from '../Request'
import AuthControl from '../../components/AuthControl';

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

const Employees = props => {

    const [isRequest, setRequest] = useState(false);
    const [status, setStatus] = useState(0)
    const [isEndAdornment, setEndAdornment] = useState(false)

    const {enqueueSnackbar} = useSnackbar();

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

                } else {

                    let message = 'ошибка';
                    if (data.error === 'already_used') message = 'Такой пользователь уже зарегистрирован!';
                    if (data.error === 'wrong_format') message = 'Неправильный формат контакта!';
                    enqueueSnackbar(message, {
                            variant: 'warning',
                    })

                }
            })
    };


    const validateWait = () => {
        if (authControl.isValid("#add-employee")) {

            let isvalid = authControl.validate_phone_number("#add-employee")
                || authControl.validate_email("#add-employee")

            // console.log(isvalid)

            setEndAdornment (isvalid)
        }
    }

    const add = () => {

        request({action: 'addEmployee'}, '/settings', props.auth.jwt)
            .then(data => {

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
            slotProps={{
                input: {
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
                }
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
        {props.app.users.map(user => <Grid
            container
            direction="row"
            className={classes.hoverGrid}
            key={"grusKey" + user.id + user.verified_contact}
        > {typeof user.verified_contact === "string"
            ? <>
                <Grid size={{ xs: 12, md: 9 }}>
                    <Typography variant="subtitle1" style={{color: "gray"}}>
                        Ждет подтверждения:
                    </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <IconButton
                        color="secondary"
                        onClick={() =>
                            requestSettings("deleteWait", user.verified_contact)
                        }
                    >
                        <DeleteIcon />
                    </IconButton>
                </Grid>
                <Grid size={12}>
                    <TextField
                        defaultValue={user.verified_contact}
                        slotProps={{ input: { readOnly: true } }}
                    />
                </Grid>
            </>
            : <>
                <Grid size={{ xs: 12, md: 6 }}>
                    <PersonIcon style={{fontSize: "4rem"}}/>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <FormControlLabel
                        label={user.is_valid ? "Работает" : "Уволен"}
                        control={
                            <Switch
                                checked={!!user.is_valid}
                                onChange={(e) =>
                                    requestSettings(
                                        "changeEmployee",
                                        e.target.checked,
                                        user.id,
                                        "is_valid",
                                    )
                                }
                                color="primary"
                            />
                        }
                    />
                </Grid>
                <Grid size={12}>
                    <Typography variant="subtitle1" style={{color: "gray"}}>
                        Имя:
                    </Typography>
                    <TextField
                        defaultValue={user.name}
                        fullWidth={true}
                        onBlur={e =>
                            requestSettings("changeEmployee", e.target.value, user.id, "user")
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

export default connect(state => state)(Employees);
