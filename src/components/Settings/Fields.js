import {bindActionCreators} from "redux";
import {closeSnackbar, enqueueSnackbar, upd_app} from "../../actions/actionCreator";
import {connect} from "react-redux";
import React, {Component} from "react";
import FormControl from "@material-ui/core/FormControl";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Input from "@material-ui/core/Input";
import DeleteIcon from '@material-ui/icons/Delete';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import Typography from "@material-ui/core/Typography";
import {Button} from "@material-ui/core";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import AddCircleIcon from '@material-ui/icons/AddCircle';
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import restRequest from "../Rest";


const mapDispatchToProps = dispatch => bindActionCreators({
    enqueueSnackbar,
    closeSnackbar,
    upd_app
}, dispatch);

let request = false;

export default connect(state => (state), mapDispatchToProps)(class extends Component {

    // в Redux-store храниться состояние с сервера
    // в componentDidMount это состояние переноситься в state
    // при добавлении, удалении и редактировании полей они меняются локально
    // при нажатии сохранить изменения отправляются на сервер и затем попадают в Redux-store

    state = {
        index: 'customer',
    }

    componentDidMount() {
        this.initial()
    }

    initial(newFields) {

        let fields = [];
        (newFields || this.props.app.fields.allElements).map(v => {
            if (v.index === this.state.index) {
                fields.push({...v});
            }

            fields.sort((a, b) => a.id - b.id)

            this.setState({
                fields,
                systemFieldsHandle: 0,
            })
            return v;
        })

    }

    indexHandle(index) {
        this.setState({
            index,
            fields: this.props.app.fields.allElements
                .filter(field => field.index === index)
        })
    }

    addField() {

        let fields = this.state.fields
        if (this.state.systemFieldsHandle === 0) {

            fields.splice(0, 0, {
                index: this.state.index,
                value: '',
                is_system: false,
                is_valid: true,
            })
            this.setState({fields})

        } else {

            let fields = this.state.fields.map(f => {
                if (f.name === this.state.systemFieldsHandle) f.is_valid = true;
                return f;
            })
            this.setState({
                fields,
                systemFieldsHandle: 0
            })

        }
    }

    fieldHandle(name, value) {

        let fields = this.state.fields
        fields.find(field => field.name === name).value = value
        this.setState({fields})

    }

    moveField(name, direction) {

        let field = this.state.fields.filter(f => f.name === name)[0]
        let i = this.state.fields.indexOf(field)
        let fields = this.state.fields.filter(f => f.name !== name)

        if (direction === 'up') i--
        if (direction === 'down') i++
        if (i === -1) i = 0

        fields.splice(i, 0, field)

        this.setState({fields})

    }

    deleteField(field) {

        const fields = field.is_system ?
            this.state.fields.map(el => el === field
                ? {...el, is_valid: false}
                : el
            ) :
            this.state.fields.filter(f => f.name !== field.name);

        this.setState({fields})

    }

    save() {

        request = true;
        restRequest('fields', 'PATCH', this.state.fields)
            .then(res => {
                request = false;
                const {upd_app} = this.props;
                upd_app(res.body)
                this.initial(res.body.fields.allElements)
            })
    }

    render() {

        if (typeof this.state.fields === "object") {

            let index = this.state.index;

            return <Paper style={{padding: '1rem'}}>
                <Grid container direction="row" justify="space-evenly"
                      style={{marginBottom: '1rem'}}
                >

                    <Select
                        style={{width: '75%'}}
                        value={index}
                        onChange={e => this.indexHandle(e.target.value)}
                    >
                        {['order', 'customer', 'entity'].map(i => <MenuItem value={i} key={"fieldindexmenuuywgvf" + i}>
                                <Typography variant="h5">
                                    {this.props.app.fields.alliases[i]}
                                </Typography>
                            </MenuItem>
                        )}
                    </Select>

                </Grid>

                <Grid container direction="row" justify="space-evenly"
                      style={{marginBottom: '1rem'}}
                >
                    <FormControl style={{width: '75%'}}>
                        <Select
                            variant="outlined"
                            value={this.state.systemFieldsHandle}
                            onChange={e => this.setState({systemFieldsHandle: e.target.value})}
                        >
                            <MenuItem value="0" key={"addsysmfield"}>
                                Новое поле
                            </MenuItem>
                            {this.state.fields.map(v => v.is_system && !v.is_valid ?
                                <MenuItem value={v.name} key={"addsysmfield" + v.name}>
                                    {v.value}
                                </MenuItem> : ''
                            )}
                        </Select>
                    </FormControl>

                    <Tooltip title="Добавить">
                        <IconButton
                            onClick={() => this.addField()}
                            // disabled={this.state.fields[0].value === ''}
                        >
                            <AddCircleIcon/>
                        </IconButton>
                    </Tooltip>

                </Grid>

                {this.state.fields.map((field, i) => field.is_valid
                    ? <FormControl key={"elem" + index + i}
                                   style={{
                                       width: '100%',
                                       padding: '1rem'
                                   }}>
                        <Input
                            value={field.value}
                            disabled={field.is_system}
                            onChange={e => this.fieldHandle(field.name, e.target.value)}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => this.moveField(field.name, 'down')}
                                    >
                                        {<ArrowDownwardIcon/>}
                                    </IconButton>
                                    <IconButton
                                        onClick={() => this.moveField(field.name, 'up')}
                                    >
                                        {< ArrowUpwardIcon/>}
                                    </IconButton>
                                    <IconButton
                                        onClick={() => this.deleteField(field)}
                                    >
                                        {<DeleteIcon/>}
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                    </FormControl>
                    : ''
                )}

                <Grid container justify="flex-end">
                    <Button
                        variant="contained"
                        color="secondary"
                        style={{margin: '1rem'}}
                        onClick={() => this.initial()}
                    >
                        Отмена
                    </Button>
                    <Button
                        disabled={!request && JSON.stringify(this.state.fields) === JSON.stringify(this.props.app.fields.allElements
                            .filter(field => field.index === index))
                        }
                        variant="contained"
                        color="primary"
                        style={{margin: '1rem'}}
                        onClick={() => this.save()}
                    >
                        Сохранить
                    </Button>
                </Grid>

            </Paper>

        } else return '';

    }

})
