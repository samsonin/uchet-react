import {bindActionCreators} from "redux";
import {upd_app} from "../../actions/actionCreator";
import {connect} from "react-redux";
import React, {Component, useEffect, useState} from "react";
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
import rest from "../Rest";


const mapDispatchToProps = dispatch => bindActionCreators({upd_app}, dispatch);

const Fields = props => {

    // в Redux-store храниться состояние с сервера
    // в componentDidMount это состояние переноситься в state
    // при добавлении, удалении и редактировании полей они меняются локально
    // при нажатии сохранить изменения отправляются на сервер и затем попадают в Redux-store

    const [index, setIndex] = useState('entity')
    const [fields, setFields] = useState(() => initial())
    const [systemFieldsHandle, setSystemFieldsHandle] = useState(0)
    const [request, setRequest] = useState(false)

    function initial(newFields) {

        if (typeof props.app.fields.allElements === "undefined") return

        let fields = [];
        (newFields || props.app.fields.allElements).map(v => {
            if (v.index === index) {
                fields.push({...v});
            }

            fields.sort((a, b) => a.id - b.id)

            return v;
        })

        return fields

    }

    useEffect(() => {

        console.log(fields)

    }, [fields])

    const indexHandle = index => {

        setIndex(index)
        setFields(props.app.fields.allElements
            .filter(field => field.index === index))

    }

    const addField = () => {

        setFields(prev => {

            if (systemFieldsHandle === 0) {
                let newFields = [...prev]
                newFields.splice(0, 0, {
                    index,
                    value: '',
                    is_system: false,
                    is_valid: true,
                })
                return newFields
            }

            setSystemFieldsHandle(0)

            return prev.map(f => {
                if (f.name === systemFieldsHandle) f.is_valid = true
                return f
            })

        })

    }

    const fieldHandle = (name, value) => {

        setFields(prev => [...prev].map(f => {

            if (f.name === name) f.value = value

            return f

        }))

    }

    const moveField = (name, direction) => {

        setFields(prev => {

            let field = prev.filter(f => f.name === name)[0]
            let i = prev.indexOf(field)
            let newFields = fields.filter(f => f.name !== name)

            if (direction === 'up') i--
            if (direction === 'down') i++
            if (i === -1) i = 0

            newFields.splice(i, 0, field)

            return newFields

        })

    }

    const deleteField = field => {

        setFields(prev => field.is_system
            ? fields.map(el => el === field
                ? {...el, is_valid: false}
                : el
            )
            : fields.filter(f => f.name !== field.name))

    }

    const save = () => {

        setRequest(true)

        rest('fields', 'PATCH', fields)
            .then(res => {

                setRequest(false)

                if (res.status === 200) {
                    props.upd_app(res.body)
                    initial(res.body.fields.allElements)
                }

            })
    }

    let disabled = request || JSON.stringify(fields) === JSON.stringify(props.app.fields.allElements
        .filter(f => f.index === index))

    return typeof fields === "object"
        ? <Paper style={{padding: '1rem'}}>
            <Grid container justify="space-evenly"
                  style={{marginBottom: '1rem'}}
            >

                <Select
                    style={{width: '75%'}}
                    value={index}
                    onChange={e => indexHandle(e.target.value)}
                >
                    {['order', 'customer', 'entity'].map(i => <MenuItem value={i} key={"fieldindexmenuuywgvf" + i}>
                            <Typography variant="h5">
                                {props.app.fields.alliases[i]}
                            </Typography>
                        </MenuItem>
                    )}
                </Select>

            </Grid>

            <Grid container justify="space-evenly"
                  style={{marginBottom: '1rem'}}
            >
                <FormControl style={{width: '75%'}}>
                    <Select
                        variant="outlined"
                        value={systemFieldsHandle}
                        onChange={e => setSystemFieldsHandle(e.target.value)}
                    >
                        <MenuItem value="0" key={"addsysmfield"}>
                            Новое поле
                        </MenuItem>
                        {fields.map(v => v.is_system && !v.is_valid ?
                            <MenuItem value={v.name} key={"addsysmfield" + v.name}>
                                {v.value}
                            </MenuItem> : ''
                        )}
                    </Select>
                </FormControl>

                <Tooltip title="Добавить">
                    <IconButton
                        onClick={() => addField()}
                    >
                        <AddCircleIcon/>
                    </IconButton>
                </Tooltip>

            </Grid>

            {fields.map((field, i) => field.is_valid
                ? <FormControl key={"elem" + index + i}
                               style={{
                                   width: '100%',
                                   padding: '1rem'
                               }}>
                    <Input
                        value={field.value}
                        disabled={field.is_system}
                        onChange={e => fieldHandle(field.name, e.target.value)}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => moveField(field.name, 'down')}
                                >
                                    <ArrowDownwardIcon/>
                                </IconButton>
                                <IconButton
                                    onClick={() => moveField(field.name, 'up')}
                                >
                                    <ArrowUpwardIcon/>
                                </IconButton>
                                <IconButton
                                    onClick={() => deleteField(field)}
                                >
                                    <DeleteIcon/>
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                </FormControl>
                : ''
            )}

            <Grid container
                  justify="space-evenly"
            >
                <Button
                    disabled={disabled}
                    variant="contained"
                    color="secondary"
                    onClick={() => initial()}
                >
                    Отмена
                </Button>
                <Button
                    disabled={disabled}
                    variant="contained"
                    color="primary"
                    onClick={() => save()}
                >
                    Сохранить
                </Button>
            </Grid>

        </Paper>
        : ''

}

export default connect(state => state, mapDispatchToProps)(Fields)