import {
  Fab,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  Switch,
  TextField,
  Typography,
} from "@material-ui/core";
import PersonIcon from "@material-ui/icons/Person";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  closeSnackbar,
  enqueueSnackbar,
  upd_app,
} from "../../actions/actionCreator";
import DeleteIcon from "@material-ui/core/SvgIcon/SvgIcon";
import React from "react";

// TODO переделать компонент на функциональный,
// избавиться от classname и переписать используя @material-ui
// сократить и оптимизировать код
// пожалуйста, работайте в отдельной ветке гита

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      enqueueSnackbar,
      closeSnackbar,
      upd_app,
    },
    dispatch
  );

export const Employees = ({ app }) => {
  const requestSettings = () => {};
  return app.users.map((v) => {
    if (typeof v.verified_contact === "string")
      return (
        <Grid
          container
          direction="row"
          className="hoverable m-2 p-3"
          key={"grusKey" + v.id}
        >
          <Grid item xs={9}>
            <Typography variant="subtitle1" style={{ color: "gray" }}>
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
              <DeleteIcon />
            </IconButton>
          </Grid>
          <Grid item xs={12}>
            <TextField
              defaultValue={v.verified_contact}
              className="w-75"
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
        </Grid>
      );
    else
      return (
        <Grid
          container
          direction="row"
          className="hoverable m-2 p-3"
          key={"grusKey" + v.id}
        >
          <Grid item xs={6}>
            <PersonIcon style={{ fontSize: "4rem" }} />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              label={v.is_valid ? "Работает" : "Уволен"}
              control={
                <Switch
                  checked={v.is_valid}
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
            <Typography variant="subtitle1" style={{ color: "gray" }}>
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
        </Grid>
      );
  });
};

export default connect((state) => state, mapDispatchToProps)(Employees);
