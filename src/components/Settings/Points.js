import {Fab, FormControlLabel, Grid, InputLabel, Switch, TextField, Typography} from "@material-ui/core";
import React from "react";
import AddIcon from "@material-ui/core/SvgIcon/SvgIcon";

// TODO переделать компонент на функциональный,
// избавиться от classname и переписать используя @material-ui
// сократить и оптимизировать код
// пожалуйста, работайте в отдельной ветке гита

export const Points = () => {

    return '';

    // renderFab = () => <Fab color="primary" aria-label="add" className="addfab" onClick={this.add}>
    //     <AddIcon/>
    // </Fab>

    return this.props.app.stocks.map(v => {
        return (
            <Grid container direction="row" className="hoverable m-2 p-3" key={"grKey" + v.id}>
                <Grid item xs={9}>
                    <Typography variant="h3">
                        <i className="fas fa-store"/>
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <FormControlLabel
                        label={v.is_valid ? 'Активна' : 'Не активна'}
                        control={<Switch checked={v.is_valid}
                                         onChange={e => this.requestSettings('changePoint', v.id, 'is_valid', e.target.checked)}
                                         color="primary"/>}
                    />
                    {/*{!v.is_valid && v.canDelete ?*/}
                    {/*    <IconButton color="secondary" onClick={() => this.deletePoint(v.id)}>*/}
                    {/*        <DeleteIcon/>*/}
                    {/*    </IconButton> : ''}*/}
                </Grid>
                <Grid item xs={12}>
                    <InputLabel className="mt-2 font-weight-bold">Название:</InputLabel>
                    <TextField
                        defaultValue={v.name} className="w-75"
                        onBlur={e => this.requestSettings('changePoint', v.id, 'name', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <InputLabel className="mt-2 font-weight-bold">Адрес:</InputLabel>
                    <TextField
                        defaultValue={v.address} className="w-75"
                        onBlur={(e) => this.requestSettings('changePoint', v.id, 'address', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <InputLabel className="mt-2 font-weight-bold">Телефон:</InputLabel>
                    <TextField
                        defaultValue={v.phone_number} className="w-75"
                        onBlur={e => this.requestSettings('changePoint', v.id, 'phone_number', e.target.value)}
                    />
                </Grid>
            </Grid>
        )
    })
}
