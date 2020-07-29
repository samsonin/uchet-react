import React from "react";
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
import DeleteIcon from "@material-ui/core/SvgIcon/SvgIcon";
import AddIcon from "@material-ui/icons/Add";
import {makeStyles} from "@material-ui/core/styles";

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

const Employees = ({app}) => {
    const requestSettings = () => {
    };
    const validateWait = () => {
    };
    const add = () => {
    };
    const classes = useStyles();

    const renderAddEmployee = () => {
        return (
            <TextField
                id="add-employee"
                className={`${classes.fab} ${classes.ml45}`}
                variant="outlined"
                label="Контакт сотрудника"
                onChange={validateWait}
            />
        );
    };

    const renderAddEmployeeEnter = () => (
        <Fab
            color="primary"
            aria-label="add"
            className={`${classes.fab} ${classes.ml35}`}
            onClick={requestSettings(
                "addEmployee",
                "",
                "",
                document.getElementById("add-employee").value
            )}
        >
            <AddIcon size="large"/>
        </Fab>
    );

    const renderFab = () => (
        <Fab
            color="primary"
            aria-label="add"
            className={`${classes.fab} ${classes.ml45}`}
            onClick={add}
        >
            <PersonAddIcon size="large"/>
        </Fab>
    );

    return app.users.map(v => <Grid
            container
            direction="row"
            className={classes.hoverGrid}
            key={"grusKey" + v.id}
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
                        requestSettings("deleteWait", "", "", v.verified_contact)
                    }
                >
                    <DeleteIcon/>
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
                                    v.id,
                                    "is_valid",
                                    e.target.checked
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
                        requestSettings("changeEmployee", v.id, "user", e.target.value)
                    }
                />
            </Grid>
        </>}
        {renderFab()}
        </Grid>
    );
};

export default connect((state) => state, mapDispatchToProps)(Employees);
