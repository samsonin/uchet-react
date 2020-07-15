import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {enqueueSnackbar, upd_app} from "../actions/actionCreator";
import {connect} from "react-redux";

import {Paper, Grid, Typography, Button} from "@material-ui/core";
import styled from "@material-ui/core/styles/styled";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

import restRequest from "./Rest";
import Field from "./Field";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";


const types = {
    birthday: 'date',
    doc_date: 'date',
}

const mapDispatchToProps = dispatch => bindActionCreators({
    enqueueSnackbar,
    upd_app
}, dispatch);

const MyButton = styled(Button)({
    borderRadius: 3,
    margin: '1rem'
});

export default connect(state => (state), mapDispatchToProps)(class extends Component {

    state = {
        request: false,
        isDetails: false,
        customer: {}
    }

    componentDidMount() {

        let id = +this.props.match.params.id;
        if (id > 0) {
            this.setState({request: true})
            restRequest('customers/' + id)
                .then(res => {
                    if (res.ok) this.setState({customer: res.body});
                    this.setState({request: false})
                })
        }

    }

    create() {
        this.setState({request: true})
        restRequest('customers',
            'POST',
            this.state.customer
        )
            .then(res => {
                this.setState({request: false})
            })
    }

    update() {
        this.setState({request: true})
        restRequest('customers/' + this.state.customer.id,
            'PUT',
            this.state.customer
        )
            .then(res => {
                this.setState({request: false})
            })
    }

    handleChange(name, value) {
        let customer = this.state.customer;
        customer[name] = value
        this.setState({customer})
    }

    render() {
        return this.state.customer ?
            <Grid container component={Paper} spacing={1} justify="space-around">

                <Grid container
                      style={{margin: '1rem'}}
                      direction="row"
                      justify="space-between"
                >
                    <Grid item>
                        <Typography variant="h6">
                            {this.state.customer.id > 0 ?
                                '#' + this.state.customer.id :
                                'Физ. лицо'}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Tooltip title={
                            this.state.isDetails ?
                                '' :
                                'Подробнее'
                        }>
                            <IconButton
                                onClick={() => this.setState({isDetails: !this.state.isDetails})}
                            >
                                {this.state.isDetails ?
                                    <ExpandLessIcon/> :
                                    <ExpandMoreIcon/>
                                }
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>

                <Grid item xs={12}>
                    {
                        this.props.app.fields.allElements
                            .filter(field => field.index === 'customer' && field.is_valid)
                            .filter(field => this.state.isDetails || ['fio', 'phone_number'].includes(field.name))
                            .map(field => <Field
                                key={'customerfieldskey' + field.name}
                                type={types[field.name] || 'text'}
                                label={field.value}
                                value={this.state.customer[field.name]}
                                onChange={e => this.handleChange(field.name, e.target.value)}
                            />)
                    }
                </Grid>
                <Grid item>
                    {/*<MyButton*/}
                    {/*    variant="contained"*/}
                    {/*    color="secondary"*/}
                    {/*    size="small"*/}
                    {/*>*/}
                    {/*    Отмена*/}
                    {/*</MyButton>*/}
                    <MyButton
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => this.update()}
                        disabled={this.state.request}
                    >
                        {this.state.customer.id > 0 ?
                            'Сохранить' :
                            'Создать'}
                    </MyButton>
                </Grid>
            </Grid> :
            <Typography variant="h6" style={{margin: '2rem'}}>
                Загружаем данные...
            </Typography>
    }

})