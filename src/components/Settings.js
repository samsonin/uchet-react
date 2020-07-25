import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

import {
    Grid,
    Typography,
    Box,
    Fab,
    Button
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import {MDBBtn} from "mdbreact";

import AuthControl from './AuthControl';
import request from "./Request";
import {closeSnackbar, enqueueSnackbar, upd_app} from "../actions/actionCreator";

let authControl = new AuthControl();

const defaultState = {
    isUserNamePasswordAsk: false,
    isEmailPasswordAsk: false,
    isEmailConfirm: false,
    isPhoneNumberPasswordAsk: false,
    isPhoneNumberConfirm: false,
    isPasswordPasswordAsk: false,
    tab: 5,
    isAddEmployee: false,
    isCanAddEmployee: false,
    autocomplete: [],
    innValue: "0",
    bankName: "Банк"
};

const mapDispatchToProps = dispatch => bindActionCreators({
    enqueueSnackbar,
    closeSnackbar,
    upd_app
}, dispatch);

export default connect(state => (state), mapDispatchToProps)(class extends Component {

    state = defaultState;

    componentDidMount() {
        this.setState({innValue: this.props.app.organization.inn})
        this.setState({bankName: this.props.app.organization.bankName})
    }

    request = (password, index, value, confirmation_code = '') => {

        request({
            user_id: this.props.auth.user_id,
            action: 'user_setting_change',
            password,
            index,
            value,
            confirmation_code
        })
            .then(data => {
                try {
                    if (data.result) {
                        if (data.need_confirm) {
                            if (index === 'email') this.setState({isEmailConfirm: true});
                            if (index === 'phone_number') this.setState({isPhoneNumberConfirm: true});
                        } else {
                            this.props.enqueueSnackbar({
                                message: 'Изменения сохранены',
                                options: {
                                    variant: 'success',
                                }
                            });

                            if (index === 'user') {
                                const {upd_app} = this.props;
                                upd_app(this.props.app.balance, this.props.app.stock_id, this.props.app.stocks, this.props.app.users, this.props.app.organization, this.props.app.config, this.props.app.docs, this.props.app.fields, this.props.app.providers, this.props.app.categories);
                            }
                            this.setState(defaultState);
                        }
                    } else {
                        let message = 'Ошибка';
                        if (data.error === 'wrong_format') message = 'Неправильный формат';
                        if (data.error === 'alredy_used') message = 'Уже существует';
                        if (data.error === 'code_not_send') message = 'Ошибка отправки кода';
                        this.props.enqueueSnackbar({
                            message,
                            options: {
                                variant: 'error',
                            }
                        });
                        this.setState(defaultState);
                    }
                } catch (e) {
                    this.props.enqueueSnackbar({
                        message: 'Ошибка сервера',
                        options: {
                            variant: 'warning',
                        }
                    });
                }

            });
    };

    requestSettings = (action, id, index, value) => {

        if ((action === 'changePoint' || action === 'changeEmployee') && value === '') return false;
        if (action === 'changeOrganization') {
            if (this.props.app.organization[index] === value) return false;
        }

        request({
            action,
            id,
            index,
            value
        }, '/settings', this.props.auth.jwt)
            .then(data => {

                if (data.result) {
                    if (action === 'addEmployee') this.setState({
                        isAddEmployee: false,
                        isCanAddEmployee: false
                    });
                    if (action === 'getSuggest') this.setState({autocomplete: data.suggest});
                    const {upd_app} = this.props;
                    let stocks = typeof (data.stocks) === 'object' ?
                        data.stocks : this.props.app.stocks;
                    let users = typeof (data.users) === 'object' ?
                        data.users : this.props.app.users;
                    let organization = typeof (data.organization) === 'object' ?
                        data.organization : this.props.app.organization;
                    let config = typeof (data.config) === 'object' ?
                        data.config : this.props.app.config;
                    let docs = typeof (data.docs) === 'object' ?
                        data.docs : this.props.app.docs;
                    let fields = typeof (data.fields) === 'object' ?
                        data.fields : this.props.app.fields;
                    upd_app(this.props.app.balance, this.props.app.stock_id, stocks, users, organization, config, docs, fields, this.props.app.providers, this.props.app.categories);
                    if (index === 'bank_code') {
                        this.setState({bankName: organization.bankName})
                    }
                    if (action === 'setByInn') {

                        document.getElementById('organizationKpp').value = organization.kpp;
                        document.getElementById('organizationOgrn').value = organization.ogrn;
                        document.getElementById('organizationOkved').value = organization.okved;
                        document.getElementById('organizationLegalAddress').value = organization.legal_address;
                        document.getElementById('organizationOrganization').value = organization.organization;

                    }
                } else {
                    let message = 'ошибка';
                    if (data.error === 'already_used') message = 'Такой пользователь уже зарегистрирован!';
                    if (data.error === 'wrong_format') message = 'Неправильный формат контакта!';
                    this.props.enqueueSnackbar({
                        message,
                        options: {
                            variant: 'warning',
                        }
                    });
                }
            })
    };


    // deletePoint = id => {
    //     this.props.enqueueSnackbar({
    //         message: 'Подтвердите удаление',
    //         options: {
    //             variant: 'error',
    //             anchorOrigin: {
    //                 vertical: 'top',
    //                 horizontal: 'center',
    //             },
    //             action: <Fragment>
    //                 <Button onClick={() => {
    //                     this.requestSettings('deletePoint', id)
    //                 }}>
    //                     Удалить
    //                 </Button>
    //             </Fragment>
    //         },
    //         autoHideDuration: 3000,
    //     });
    // };
    //
    // add = () => {
    //
    //     let action = this.state.tab === 2 ? 'addEmployee' : this.state.tab === 3 ? 'addPoint' : false;
    //
    //     if (action === 'addPoint') {
    //         this.props.app.stocks.map(value => {
    //             if (value.name === '') {
    //                 this.props.enqueueSnackbar({
    //                     message: 'Существует точка без названия, создать новую невозможно!',
    //                     options: {
    //                         variant: 'warning',
    //                     }
    //                 });
    //                 action = false;
    //             }
    //             return value;
    //         })
    //     }
    //
    //     if (action === 'addEmployee') {
    //         this.setState({isAddEmployee: true});
    //         return;
    //     }
    //
    //     if (action) {
    //
    //
    //         request({action}, '/settings', this.props.auth.jwt)
    //             .then(data => {
    //
    //                 if (data.result) {
    //                     const {upd_app} = this.props;
    //                     upd_app(this.props.app.balance, this.props.app.stock_id, data.stocks, this.props.app.users, this.props.app.organization, this.props.app.config, this.props.app.docs, this.props.app.fields, this.props.app.providers, this.props.app.categories);
    //                 }
    //             });
    //
    //     }
    // };


    validateWait = e => {
        if (authControl.isValid("#add-employee")) {
            this.setState({
                isCanAddEmployee: authControl.validate_phone_number("#add-employee")
                    || authControl.validate_email("#add-employee")
            })
        }
    }

    userNameHandler = () => {
        if (authControl.isValid('setting_user_name_input_id')) {
            if (this.state.isUserNamePasswordAsk) {
                if (authControl.isValid('userNamePasswordAskInputId')) {
                    let user = document.querySelector('#setting_user_name_input_id');
                    this.request(document.querySelector('#userNamePasswordAskInputId').value, 'user', user.value);
                    user.value = '';
                }
            } else this.setState({isUserNamePasswordAsk: true})
        }
    };

    emailHandler = () => {
        if (authControl.validate_email('setting_email_input_id')) {
            if (this.state.isEmailPasswordAsk) {
                if (authControl.isValid('emailPasswordAskInputId')) {
                    this.request(
                        document.querySelector('#emailPasswordAskInputId').value,
                        'email',
                        document.querySelector('#setting_email_input_id').value,
                        document.querySelector('#setting_email_confirmation_code_input_id').value
                    );
                }
            } else this.setState({isEmailPasswordAsk: true});
        }
    };

    phoneNunberHandler = () => {
        if (authControl.validate_phone_number('setting_phone_number_input_id')) {
            if (this.state.isPhoneNumberPasswordAsk) {
                if (authControl.isValid('phoneNumberPasswordAskInputId')) {
                    this.request(
                        document.querySelector('#phoneNumberPasswordAskInputId').value,
                        'phone_number',
                        document.querySelector('#setting_phone_number_input_id').value,
                        document.querySelector('#setting_phone_number_confirmation_code_input_id').value);
                }
            } else this.setState({isPhoneNumberPasswordAsk: true});
        }
    };

    passwordHandler = () => {
        if (authControl.validate_passwords('setting_password_input_id', 'setting_password2_input_id', true)) {
            if (this.state.isPasswordPasswordAsk) {
                if (authControl.isValid('passwordPasswordAskInputId')) {
                    let pass = document.querySelector('#setting_password_input_id');
                    this.request(document.querySelector('#passwordPasswordAskInputId').value, 'pass', pass.value);
                    pass.value = '';
                    document.querySelector('#setting_password2_input_id').value = '';
                }
            } else this.setState({isPasswordPasswordAsk: true})
        }
    };

    renderOwnSettings() {
        return <div>

            {this.props.auth.admin ?
                authControl.renderUserNameDiv(
                    'setting_user_name_input_id',
                    this.state.isUserNamePasswordAsk || !this.props.auth.admin) :
                ''}
            {this.state.isUserNamePasswordAsk ?
                authControl.renderPasswordDiv(
                    '',
                    'userNamePasswordAskInputId',
                    '',
                    'Текущий пароль') :
                ''}
            {this.state.isUserNamePasswordAsk ?
                <MDBBtn color="danger" onClick={() => {
                    this.setState({isUserNamePasswordAsk: false});
                }}>
                    Отмена
                </MDBBtn> :
                ''}
            <MDBBtn color="blue" onClick={this.userNameHandler}>Изменить имя пользователя</MDBBtn>

            {authControl.renderEmailDiv(
                '',
                'setting_email_input_id',
                authControl.validate_email,
                this.state.isEmailPasswordAsk || this.state.isEmailConfirm)
            }
            {this.state.isEmailPasswordAsk ?
                authControl.renderPasswordDiv(
                    '',
                    'emailPasswordAskInputId',
                    '',
                    'Текущий пароль',
                    this.state.isEmailConfirm) : ''
            }
            {this.state.isEmailConfirm ?
                authControl.renderConfirmationCodeDiv(
                    'setting_email_confirmation_code_input_id',
                    'Подтверждение Email') : ''
            }
            {(this.state.isEmailPasswordAsk || this.state.isEmailConfirm) ?
                <MDBBtn color="danger" onClick={() => this.setState({
                    isEmailPasswordAsk: false,
                    isEmailConfirm: false
                })}>Отмена</MDBBtn> : ''}
            <MDBBtn color="blue" onClick={this.emailHandler}>Изменить email</MDBBtn>

            {authControl.renderPhoneNumberDiv(
                '',
                'setting_phone_number_input_id',
                authControl.validate_phone_number,
                this.state.isPhoneNumberPasswordAsk || this.state.isPhoneNumberConfirm)
            }
            {this.state.isPhoneNumberPasswordAsk ?
                authControl.renderPasswordDiv(
                    '',
                    'phoneNumberPasswordAskInputId',
                    '',
                    'Текущий пароль',
                    this.state.isPhoneNumberConfirm) : ''
            }
            {this.state.isPhoneNumberConfirm ?
                authControl.renderConfirmationCodeDiv(
                    'setting_phone_number_confirmation_code_input_id',
                    'Подтверждение номера телефона') : ''
            }
            {(this.state.isPhoneNumberPasswordAsk || this.state.isPhoneNumberConfirm) ?
                <MDBBtn color="danger" onClick={() => this.setState({
                    isPhoneNumberPasswordAsk: false,
                    isPhoneNumberConfirm: false
                })}>Отмена</MDBBtn> : ''}
            <MDBBtn color="blue" onClick={this.phoneNunberHandler}>Изменить номер телефона</MDBBtn>

            {authControl.renderPasswordDiv(
                '',
                'setting_password_input_id',
                '',
                'Новый пароль',
                this.state.isPasswordPasswordAsk)
            }
            {authControl.renderPasswordDiv(
                '',
                'setting_password2_input_id',
                '',
                'Новый пароль еще раз',
                this.state.isPasswordPasswordAsk)
            }
            {this.state.isPasswordPasswordAsk ?
                authControl.renderPasswordDiv(
                    '',
                    'passwordPasswordAskInputId',
                    '',
                    'Текущий пароль') :
                ''}
            {this.state.isPasswordPasswordAsk ?
                <MDBBtn color="danger" onClick={() => {
                    this.setState({isPasswordPasswordAsk: false});
                }}>
                    Отмена
                </MDBBtn> :
                ''}
            <MDBBtn color="blue" onClick={this.passwordHandler}>Изменить пароль</MDBBtn>

        </div>
    }

    render() {

        return <div className="container-fluid m-4">
            {this.renderOwnSettings()}
        </div>;

    }

});
