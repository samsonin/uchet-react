import {bindActionCreators} from "redux";
import {closeSnackbar, enqueueSnackbar, upd_app} from "../actions/actionCreator";
import {connect} from "react-redux";
import React, {Component, Fragment} from "react";
import request from "./Request";
import FormControl from "@material-ui/core/FormControl";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Input from "@material-ui/core/Input";
import DeleteIcon from '@material-ui/icons/Delete';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import SaveIcon from '@material-ui/icons/Save';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import Typography from "@material-ui/core/Typography";
import {Button} from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import {Link} from "react-router-dom";
import AddCircleIcon from '@material-ui/icons/AddCircle';
import TableCell from "@material-ui/core/TableCell/TableCell";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Icon from "@material-ui/core/Icon";


const mapDispatchToProps = dispatch => bindActionCreators({
    enqueueSnackbar,
    closeSnackbar,
    upd_app
}, dispatch);

export default connect(state => (state), mapDispatchToProps)(class extends Component {

    state = {
        index: 'customer',
    }

    componentDidMount() {

        let state = {}

        this.props.app.fields.allElements
            .filter(field => field.index === this.state.index)
            .map(v => console.log(v))

        // for (let key in arr) {
            // console.log(obj[key])
            // state[key] = arr[key]
            // console.log(state)
        // }
        // .map(field => {
        //     state.push(field)
        // })

        // console.log(arr)
        // console.log(state)


        this.setState(state)

    }

    indexHandle(index) {
        this.setState({
            index,
            fields: this.props.app.fields.allElements
                .filter(field => field.index === index)
        })
    }

    fieldHandle(name, value) {

        let fields = this.state.fields
        fields.find(field => field.name === name).value = value
        this.setState({fields})

        console.log(fields)

    }

    render() {

        if (typeof this.state.fields === "object") {

            let index = this.state.index;

            console.log(JSON.stringify(this.state.fields))
            console.log(JSON.stringify(this.props.app.fields.allElements
                .filter(field => field.index === index)))

            return <Paper style={{padding: '1rem'}}>
                <Grid container direction="row" justify="space-evenly"
                      style={{marginBottom: '1rem'}}
                >

                    <Select
                        variant="outlined"
                        style={{width: '75%'}}
                        value={this.state.index}
                        onChange={e => this.indexHandle(e.target.value)}
                    >
                        {['order', 'customer'].map(i => <MenuItem value={i}>
                                {this.props.app.fields.alliases[i]}
                            </MenuItem>
                        )}
                    </Select>

                    <Tooltip title="Добавить">
                        <IconButton>
                            <AddCircleIcon/>
                        </IconButton>
                    </Tooltip>
                </Grid>

                {/*{this.state !== null && this.state.newFields[index] === '' ?*/}
                {/*    <FormControl variant="outlined" className="m-2 w-25" key={"addsysmfcw4g45" + index}>*/}
                {/*        <InputLabel>*/}
                {/*            Системные поля*/}
                {/*        </InputLabel>*/}
                {/*        <Select*/}
                {/*            value=""*/}
                {/*            onChange={(e) => this.changeForm(index, e.target.value, 'setValid')}*/}
                {/*            className="m-2 w-100"*/}
                {/*            autoWidth*/}
                {/*        >*/}
                {/*            /!*{this.props.app.fields.allElements[index].map((v) => v.isSystem && !v.isValid ?*!/*/}
                {/*            /!*    <MenuItem value={v.name} key={"addsysmfield" + v.name}>*!/*/}
                {/*            /!*        {v.value}*!/*/}
                {/*            /!*    </MenuItem> : ''*!/*/}
                {/*            /!*)}*!/*/}
                {/*        </Select>*/}
                {/*    </FormControl>*/}
                {/*    : ''}*/}

                {this.state.fields.map(field => <FormControl key={"elem" + index + field.name}
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
                                        onClick={() => this.changeForm(index, field.name, 'down')}
                                    >
                                        {<ArrowDownwardIcon/>}
                                    </IconButton>
                                    <IconButton
                                        onClick={() => this.changeForm(index, field.name, 'up')}
                                    >
                                        {< ArrowUpwardIcon/>}
                                    </IconButton>
                                    <IconButton
                                        onClick={() => this.removeField(index, field.name, field.value)}
                                    >
                                        {<DeleteIcon/>}
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                    </FormControl>
                )}

                <Grid container justify="flex-end">
                    <Button
                        // disabled={
                        //     JSON.stringify(this.state.fields) === JSON.stringify(this.props.app.fields.allElements
                        //         .filter(field => field.index === index))
                        // }
                        variant="contained"
                        color="primary"
                        style={{margin: '1rem'}}
                        // onClick={}
                    >
                        Сохранить
                    </Button>
                </Grid>

            </Paper>

            // let arr = [];
            // for (let i in this.props.app.fields.allElements) {
            //     arr.push(
            //         <div key={"divkey" + i}>
            //             <Typography key={"typkey" + i} variant="h5" className={"w-50"}>
            //                 {this.props.app.fields.alliases[i]}
            //             </Typography>
            //             <MDBBtn key={"mdbkey" + i} className="btn-sm m-2" color="success"
            //                     disabled={this.state !== null && this.state.newFields[i] !== undefined}
            //                     onClick={(e) => this.addLocal(i)}
            //             >
            //                 + Добавить поле
            //             </MDBBtn>
            //
            //
            //         </div>
            //     )
            //
            //     if (this.state !== null && this.state.newFields[i] !== undefined) {
            //         arr.push(
            //             <FormControl key={"eleavqerm" + i} className={"m-2 p-2 w-100"}>
            //                 <Input
            //                     onChange={(e) => this.changeLocal(i, e.target.value)}
            //                     endAdornment={
            //                         <InputAdornment position="end">
            //                             {this.state.newFields[i] === '' ? '' :
            //                                 <IconButton
            //                                     onClick={(e) => this.saveLocal(i, e.target.value)}
            //                                 >
            //                                     {<DoneIcon/>}
            //                                 </IconButton>
            //                             }
            //                             <IconButton
            //                                 onClick={(e) => this.deleteLocal(i)}
            //                             >
            //                                 {<DeleteIcon/>}
            //                             </IconButton>
            //                         </InputAdornment>
            //                     }
            //                 />
            //             </FormControl>
            //         )
            //     }
            //
            //     this.props.app.fields.allElements[i].map((val, index) => {
            //
            //         if (val.isValid && !val.isOnlySystem) {
            //             arr.push(
            //                 <FormControl key={"elem" + i + index + val.name} className={"m-2 p-2 w-100"}>
            //                     <Input
            //                         // defaultValue={val.value}
            //                         value={this.state === null ?
            //                             '' : this.state.allElements === undefined ?
            //                                 '' : this.state.allElements[i][index] === undefined ?
            //                                     '' : this.state.allElements[i][index].value
            //                         }
            //                         disabled={val.isSystem}
            //                         onChange={(e) => this.ckeckChange(index, val.name, e.target.value)}
            //                         endAdornment={
            //                             <InputAdornment position="end">
            //                                 {val.isChanged ? <IconButton
            //                                     onClick={(e) => this.changeForm(index, val.name, 'update')}
            //                                 >
            //                                     {<DoneIcon/>}
            //                                 </IconButton> : ''
            //                                 }
            //                                 <IconButton
            //                                     onClick={(e) => this.changeForm(index, val.name, 'down')}
            //                                 >
            //                                     {<ArrowDownwardIcon/>}
            //                                 </IconButton>
            //                                 <IconButton
            //                                     onClick={(e) => this.changeForm(index, val.name, 'up')}
            //                                 >
            //                                     {< ArrowUpwardIcon/>}
            //                                 </IconButton>
            //                                 <IconButton
            //                                     onClick={(e) => this.removeField(index, val.name, val.value)}
            //                                 >
            //                                     {<DeleteIcon/>}
            //                                 </IconButton>
            //                             </InputAdornment>
            //                         }
            //                     />
            //                 </FormControl>
            //             )
            //         }
            //     })
            // }
            // return arr;

        } else return '';

    }

})