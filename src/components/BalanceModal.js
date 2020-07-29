import React, {Component} from "react";
import {
    MDBBtn,
    MDBModal,
    MDBModalBody,
    MDBModalFooter,
    MDBModalHeader,
} from "mdbreact";
import {bindActionCreators} from "redux";
import {init_user} from "../actions/actionCreator";
import {connect} from "react-redux";

import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";

class balanceModal extends Component {

    state = {
        counter: 0,
        isOpen: false,
        sum: 300,
        paymentType: 'AC',   //PC, AC, MC
    };

    componentDidUpdate = () => {
        if (this.state.counter !== this.props.counter) this.setState({
            counter: this.state.counter + 1,
            isOpen: true
        })
    };

    toggle = () => this.setState({isOpen: false});

    sumChange = () => {
        const paymentSum = document.querySelector('#paymentSum')
        let sum = +paymentSum.value;
        if (sum < 10 ) sum = 10;
        this.setState({sum});
    };

    radioChange = event => this.setState({paymentType: event.target.value});

    paymentFormSubmitter = event => {
        event.preventDefault()
        document.querySelector('#paymentForm')
            .submit()
    }

    render() {
        return (
            <MDBModal isOpen={this.state.isOpen} toggle={this.toggle}>
                <MDBModalHeader toggle={this.toggle} className="font-weight-bold">
                    Пополнение счета
                </MDBModalHeader>

                <MDBModalBody>

                    <form id="paymentForm" onSubmit={this.sumChange} method="POST"
                          action="https://money.yandex.ru/quickpay/confirm.xml">
                        <input type="hidden" name="receiver" value="410012390556672"/>
                        <input type="hidden" name="quickpay-form" value="shop"/>
                        <input type="hidden" name="successURL" value="https://uchet.store"/>
                        <input type="hidden" name="targets" value="Пополнение счета в Uchet.store"/>
                        <input type="hidden" name="label" value={this.props.organization_id}/>

                        <Grid container direction="row" justify="center" alignItems="center">
                            <TextField
                                id="paymentSum"
                                name="sum"
                                label="Сумма платежа, руб."
                                value={this.state.sum}
                                onChange={this.sumChange}
                                type="number"
                                margin="normal"
                            />
                        </Grid>

                        <Grid container direction="row" justify="center" alignItems="center">
                            <RadioGroup name="paymentType" value={this.state.paymentType} onChange={this.radioChange}>
                                <FormControlLabel
                                    checked={"PC" === this.state.paymentType}
                                    value="PC"
                                    control={<Radio color="primary"/>}
                                    label="Яндекс Деньги"
                                />
                                <FormControlLabel
                                    checked={"AC" === this.state.paymentType}
                                    value="AC"
                                    control={<Radio color="primary"/>}
                                    label="Банковская карта"
                                />
                                <FormControlLabel
                                    checked={"MC" === this.state.paymentType}
                                    value="MC"
                                    control={<Radio color="primary"/>}
                                    label="Баланс телефона"
                                />
                            </RadioGroup>
                        </Grid>

                    </form>

                </MDBModalBody>

                <MDBModalFooter>
                    <MDBBtn color="secondary" onClick={this.toggle}>
                        Отмена
                    </MDBBtn>
                    <MDBBtn color="primary" onClick={this.paymentFormSubmitter}>
                        Пополнить
                    </MDBBtn>
                </MDBModalFooter>

            </MDBModal>
        )
    }

}

const mapDispatchToProps = dispatch => bindActionCreators({
    init_user
}, dispatch);

export default connect(state => (state.auth), mapDispatchToProps)(balanceModal);
