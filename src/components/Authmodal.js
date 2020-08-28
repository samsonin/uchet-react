import React, {Component} from 'react';
import {MDBBtn, MDBModal, MDBRow, MDBCol} from 'mdbreact';
import request from "./Request";
import restRequest from "./Rest";
import {connect} from "react-redux";
import {init_user, upd_app, enqueueSnackbar, closeSnackbar} from "../actions/actionCreator";
import Notifier from "./Notifier";
import {bindActionCreators} from 'redux';
import AuthControl from './AuthControl';
import {inputToA} from "./EditorFunctions";

let authControl = new AuthControl();

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

class authModal extends Component {

    // login, register, restore, register_confirm, register_invitation_confirm, restore_confirm
    state = {
        status: 'login',
        password_for_register: '',
        org_id: 0,
        org_name: ''
    };

    validate_email() {
        authControl.validate_email_phone_number('#email', '#div_phone_number');
        return authControl.validate_email('email');
    }

    validate_phone_number() {
        authControl.validate_email_phone_number('#phone_number', '#div_email');
        return authControl.validate_phone_number('phone_number');
    }

    validate_passsword = () => authControl.validate_passwords('password', 'password2', this.state.status === 'register' || this.state.status === 'restore_confirm');

    init(data) {

        let payload = parseJwt(data.JWT);
        if (typeof payload !== 'object') return false;
        const {init_user, upd_app} = this.props;
        init_user(data.JWT, +payload.user_id, +payload.organization_id, payload.admin, payload.exp);

        // data.docs.docs.map(v => {
        //     // console.log(v.doc_text)
        //     v.doc_text = inputToA(v.doc_text, data.forms.allElements);
        //     // console.log(v.doc_text)
        //     return v;
        // });

        restRequest('initial')
            .then(res => upd_app(res.body))

        return true;
    }

    key_press = (e) => {
        if (typeof e === 'undefined') return false;
        if (e.key === 'Enter') { // eslint-disable-next-line
            switch (this.state.status) {
                case "login":
                    this.enter();
                    break;
                case "register":
                    this.registration();
                    break;
                case "restore":
                    this.restore();
                    break;
                case "register_confirm":
                    this.register_confirm();
                    break;
                case "restore_confirm":
                    this.restore_confirm();
                    break;
            }
        }
    };

    enter = () => {

        if ((this.validate_email() || this.validate_phone_number()) && this.validate_passsword()) {

            request({
                action: "sign_in",
                phone_number: +document.querySelector('#phone_number').value,
                email: document.querySelector('#email').value,
                password: document.querySelector('#password').value
            })
                .then(data => {

                    try {
                        this.init(data);
                    } catch (e) {
                        this.props.enqueueSnackbar({
                            message: 'Неправильный логин или пароль',
                            options: {
                                variant: 'error',
                                autoHideDuration: 1000,
                            },
                        });
                    }

                });

        }

    };

    registration = () => {

        if (authControl.isValid('#user_name') && (this.validate_email() || this.validate_phone_number()) && this.validate_passsword()) {

            request({
                action: "confirmation_code_request",
                phone_number: +document.querySelector('#phone_number').value,
                email: document.querySelector('#email').value,
            })
                .then(data => {
                    if (data.result) {
                        let status = data.org_id ?
                            'register_invitation_confirm' : 'register_confirm';
                        this.setState({
                            status,
                            password_for_register: document.querySelector('#password').value,
                            org_id: data.org_id,
                            org_name: data.org_name
                        })
                    } else {
                        if (data.error === 'already_used') {
                            this.props.enqueueSnackbar({
                                message: 'Такой пользователь уже существует, восстановите пароль',
                                options: {
                                    variant: 'warning',
                                },
                            });
                            this.setState({status: 'restore'});
                        } else if (data.error === 'wrong_format') {
                            this.props.enqueueSnackbar({
                                message: 'Неправильный формат',
                                options: {
                                    variant: 'warning',
                                },
                            });
                            document.querySelector('#phone_number').classList.remove('valid')
                            document.querySelector('#phone_number').classList.add('invalid')
                        }
                    }

                });

        }

    }

    restore = () => {

        if (this.validate_email() || this.validate_phone_number()) {

            request({
                action: "password_restore_request",
                email: document.querySelector('#email').value,
                phone_number: +document.querySelector('#phone_number').value
            })
                .then(data => {
                    if (data.result) {
                        this.setState({status: 'restore_confirm'})
                    } else {
                        if (data.error === 'not_user') {

                            document.querySelector('#phone_number').classList.remove('valid')
                            document.querySelector('#phone_number').classList.add('invalid')
                            this.props.enqueueSnackbar({
                                message: 'Пользователь не существует',
                                options: {
                                    variant: 'error',
                                },
                            });
                        }
                    }

                });

        }

    };

    register_confirm = (isInvitation = false) => {

        if (authControl.isValid('#confirmation_code') && authControl.isValid('#user_name') && (this.validate_email() || this.validate_phone_number()) && this.validate_passsword()) {

            request({
                action: "registration",
                user_name: document.querySelector('#user_name').value,
                email: document.querySelector('#email').value,
                phone_number: +document.querySelector('#phone_number').value,
                password: this.state.password_for_register,
                confirmation_code: document.querySelector('#confirmation_code').value,
                org_id: this.state.org_id,
                isInvitation
            })
                .then(data => {

                    try {
                        if (this.init(data)) this.setState({status: 'login'});
                    } catch (e) {

                        this.props.enqueueSnackbar({
                            message: 'Ошибка регистрации',
                            options: {
                                variant: 'warning',
                            },
                        });

                    }

                });

        }

    };

    restore_confirm = () => {

        if (this.validate_passsword() && authControl.isValid('#confirmation_code')) {


            request({
                action: "password_change",
                email: document.querySelector('#email').value,
                phone_number: +document.querySelector('#phone_number').value,
                password: document.querySelector('#password').value,
                confirmation_code: document.querySelector('#confirmation_code').value,
            })
                .then(data => {
                    try {
                        if (this.init(data)) this.setState({status: 'login'});
                    } catch (e) {
                        console.log(e, data);
                        this.props.enqueueSnackbar({
                            message: 'Ошибка',
                            options: {
                                variant: 'warning',
                            },
                        });
                    }

                })
        }

    };

    password_div(id) {
        if (this.state.status === 'restore' || this.state.status === 'register_confirm') return;
        if (id !== 'password' && this.state.status === 'login') return;
        let label = 'Пароль';
        if (this.state.status === 'restore_confirm') label = 'Новый пароль';
        if (id === 'password2') label = 'Подтверждение пароля';
        return authControl.renderPasswordDiv('div_' + id, id, this.validate_passsword, label);
    }

    enter_btn() {
        return <MDBBtn className="btn-sm" onClick={this.enter}>Войти</MDBBtn>
    }

    registration_btn() {
        return <MDBBtn className="btn-sm" color="primary" onClick={this.registration}>Зарегистрироваться</MDBBtn>
    }

    restore_btn() {
        return <MDBBtn className="btn-sm" color="warning" onClick={this.restore}>Восстановить</MDBBtn>
    }

    register_confirm_btn(isInvitation = true) {
        return isInvitation ?
            <MDBBtn className="btn-sm" onClick={this.register_confirm}>
                Подтвердить
            </MDBBtn> :
            <MDBBtn className="btn-sm" onClick={this.register_confirm}>
                Нет, зарегистрировать новую организацию
            </MDBBtn>;
    }

    register_invitation_confirm_btn() {
        return <MDBBtn className="btn-sm" color="primary" onClick={() => this.register_confirm(true)}>
            Да, я сотрудник
        </MDBBtn>
    }

    restore_confirm_btn() {
        return <MDBBtn className="btn-sm" onClick={this.restore_confirm}>Подтвердить</MDBBtn>
    }

    enter_tab_btn() {
        return <MDBBtn outline className="btn-sm" color="danger"
                       onClick={() => this.setState({status: 'login'})}>Отмена</MDBBtn>
    }

    registretion_tab_btn() {
        return <MDBBtn outline className="btn-sm" color="primary"
                       onClick={() => this.setState({status: 'register'})}>Регистриция</MDBBtn>
    }

    restore_tab_btn() {
        return <MDBBtn outline className="btn-sm" color="warning" onClick={() => this.setState({status: 'restore'})}>
            Забыли пароль?
        </MDBBtn>
    }

    buttons() { // eslint-disable-next-line
        switch (this.state.status) {

            case "login":
                return <div className="modal-footer d-flex justify-content-center">
                    {this.enter_btn()}
                    {this.registretion_tab_btn()}
                    {this.restore_tab_btn()}
                </div>

            case "register":
                return <div className="modal-footer d-flex justify-content-center">
                    {this.enter_tab_btn()}
                    {this.registration_btn()}
                </div>

            case "restore":
                return <div className="modal-footer d-flex justify-content-center">
                    {this.enter_tab_btn()}
                    {this.restore_btn()}
                </div>

            case "register_confirm":
                return <div className="modal-footer d-flex justify-content-center">
                    {this.enter_tab_btn()}
                    {this.register_confirm_btn()}
                </div>

            case "register_invitation_confirm":
                return <div>
                    <div className="modal-footer d-flex justify-content-center">
                        Вы были добавленны в Uchet.Store, как сотрудник "
                        {this.state.org_name}", хотите присоединиться с этой организации?
                    </div>
                    <div className="modal-footer d-flex justify-content-center">
                        {this.register_invitation_confirm_btn()}
                        {this.register_confirm_btn(false)}
                    </div>
                    <div className="modal-footer d-flex justify-content-center">
                        {this.enter_tab_btn()}
                    </div>
                </div>

            case "restore_confirm":
                return <div className="modal-footer d-flex justify-content-center">
                    {this.enter_tab_btn()}
                    {this.restore_confirm_btn()}
                </div>

        }
    }

    render() {
        let isConfirm = this.state.status.substr(-7) === 'confirm';
        return <div onKeyPress={this.key_press}>
            <Notifier/>
            <MDBModal id="authModal" isOpen={+this.props.auth.user_id < 1} toggle={this.key_press}>

                <div className="modal-header text-center">
                    <MDBRow>
                        <MDBCol className="flex-center">
                            <img src="https://uchet.store/src/images/uchet.gif" className="imgdiv" width="120"
                                 alt="Uchet.store"/>
                        </MDBCol>
                    </MDBRow>
                </div>

                <div className="modal-body mx-3">

                    {this.state.status.substr(0, 8) === 'register' ?
                        authControl.renderUserNameDiv('user_name', isConfirm) :
                        ''}
                    {authControl.renderEmailDiv('div_email', 'email', this.validate_email, isConfirm)}
                    {authControl.renderPhoneNumberDiv('div_phone_number', 'phone_number', this.validate_phone_number, isConfirm)}
                    {this.password_div('password')}
                    {this.password_div('password2')}
                    {isConfirm ?
                        authControl.renderConfirmationCodeDiv('confirmation_code', 'Код подтверждения') :
                        ''}

                </div>

                {this.buttons()}

            </MDBModal>
        </div>
    }

}

const mapDispatchToProps = dispatch => bindActionCreators({
    enqueueSnackbar,
    closeSnackbar,
    init_user,
    upd_app
}, dispatch);

export default connect(state => (state), mapDispatchToProps)(authModal);
