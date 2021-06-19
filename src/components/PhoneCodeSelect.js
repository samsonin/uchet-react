import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {Icon} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import request from "./Request";

const useStyles = makeStyles(theme => ({
    formControl: {
        minWidth: 80,
    },
}));

export default function PhoneNumberSelect() {

    const classes = useStyles();
    const [age, setAge] = React.useState('+7');
    const [open, setOpen] = React.useState(false);
    const [countries, setCountries] = React.useState([]);

    const handleChange = event => {
        setAge(event.target.value);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const getCountries = () => {

        request({
            action: "getCountries"
        })
            .then(data => {
                if (data.result) {
                    setCountries(data.countries);
                }

            });

    };

    let c = [];
    // getCountries();

    return (
        <div>
            <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={2}>
                    <Icon className="fas fa-phone grey-text"/>
                </Grid>
                <Grid item xs={3}>
                    <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="phone-code-select">Код</InputLabel>
                        <Select
                            open={open}
                            onClose={handleClose}
                            onOpen={handleOpen}
                            value={age}
                            onChange={handleChange}
                            inputProps={{id: 'phone-code-select'}}
                        >
                            {
                                countries.map((value) => {
                                    // console.log(value);
                                    if (c.indexOf(value.code) !== -1) return;
                                    c.push(value.code);
                                        return (
                                            <MenuItem value={value.code}>{value.code}</MenuItem>
                                        )
                                    }
                                )
                            }
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    <TextField id="phone-number-input" label="Номер телефона"/>
                </Grid>
            </Grid>
        </div>
    );

}