import {Fab, FormControlLabel, Grid, IconButton, InputLabel, Switch, TextField, Typography} from "@material-ui/core";
import DeleteIcon from "@material-ui/core/SvgIcon/SvgIcon";
import React from "react";

// TODO переделать компонент на функциональный,
// избавиться от classname и переписать используя @material-ui
// сократить и оптимизировать код
// пожалуйста, работайте в отдельной ветке гита

export const Employees = () => {

    // renderAddEmployee = () => {
    //     return (
    //         <TextField id="add-employee" className="addfab"
    //                    variant="outlined" label="Контакт сотрудника"
    //                    onChange={this.validateWait}
    //         />
    //     )
    // }
    //
    // renderAddEmployeeEnter = () => <Fab color="primary"
    //                                     aria-label="add"
    //                                     className="addfab2"
    //                                     onClick={
    //                                         this.requestSettings('addEmployee', '', '', document.getElementById('add-employee').value)
    //                                     }>
    //     <i className="fas fa-plus"/>
    // </Fab>

    // renderFab = () => <Fab color="primary" aria-label="add" className="addfab" onClick={this.add}>
    //     <i className="fas fa-user-plus"/>
    // </Fab>


    return this.props.app.users.map(v => {
        if (typeof (v.verified_contact) === 'string') return (
            <Grid container direction="row" className="hoverable m-2 p-3" key={"grusKey" + v.id}>
                <Grid item xs={9}>
                    <InputLabel className="mt-2 font-weight-bold">Ждет подтверждения:</InputLabel>
                </Grid>
                <Grid item xs={3}>
                    <IconButton color="secondary"
                                onClick={() => this.requestSettings('deleteWait', '', '', v.verified_contact)}>
                        <DeleteIcon/>
                    </IconButton>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        defaultValue={v.verified_contact} className="w-75" InputProps={{
                        readOnly: true,
                    }}
                    />
                </Grid>
            </Grid>
        )
        else return (
            <Grid container direction="row" className="hoverable m-2 p-3" key={"grusKey" + v.id}>
                <Grid item xs={6}>
                    <Typography variant="h3">
                        <i className="fas fa-user"/>
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <FormControlLabel
                        label={v.is_valid ? 'Работает' : 'Уволен'}
                        control={<Switch checked={v.is_valid}
                                         onChange={(e) => this.requestSettings('changeEmployee', v.id, 'is_valid', e.target.checked)}
                                         color="primary"/>}
                    />
                </Grid>
                <Grid item xs={12}>
                    <InputLabel className="mt-2 font-weight-bold">Имя:</InputLabel>
                    <TextField
                        defaultValue={v.name} className="w-75"
                        onBlur={(e) => this.requestSettings('changeEmployee', v.id, 'user', e.target.value)}
                    />
                </Grid>
            </Grid>
        )
    })
}
