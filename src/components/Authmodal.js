import React, {useState} from 'react';
import {MDBBtn, MDBModal, MDBRow, MDBCol} from 'mdbreact';
import request from "./Request";

import {connect} from "react-redux";
import {init_user, upd_app} from "../actions/actionCreator";
import {bindActionCreators} from 'redux';
import AuthControl from './AuthControl';
import {useSnackbar} from "notistack";
// import {inputToA} from "./EditorFunctions";

let authControl = new AuthControl()

function parseJwt(token) {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
}

const mapDispatchToProps = dispatch => bindActionCreators({
    init_user,
    upd_app
}, dispatch);

export default connect(state => state, mapDispatchToProps)(props => {

    // login, register, restore, register_confirm, register_invitation_confirm, restore_confirm
    const [status, setStatus] = useState('login')
    const [regPassword, setRegPassword] = useState('')
    const [org_id, setOrgId] = useState(0)
    const [orgName, setOrgName] = useState('')

    const {enqueueSnackbar} = useSnackbar()

    const validate_email = () => {
        authControl.validate_email_phone_number('#email', '#div_phone_number');
        return authControl.validate_email('email');
    }

    const validate_phone_number = () => {
        authControl.validate_email_phone_number('#phone_number', '#div_email');
        return authControl.validate_phone_number('phone_number');
    }

    const validate_passsword = () => authControl.validate_passwords('password', 'password2', status === 'register' || status === 'restore_confirm');

    const init = data => {

        let payload = parseJwt(data.JWT);
        if (typeof payload !== 'object') return false;

        props.init_user(data.JWT, +payload.user_id, +payload.organization_id, payload.admin, payload.exp);

        return true;
    }

    const keyPress = e => {
        if (typeof e === 'undefined') return false;
        if (e.key === 'Enter') { // eslint-disable-next-line
            switch (status) {
                case "login":
                    enter();
                    break;
                case "register":
                    registration();
                    break;
                case "restore":
                    restore();
                    break;
                case "register_confirm":
                    register_confirm();
                    break;
                case "restore_confirm":
                    restore_confirm();
                    break;
            }
        }
    };

    const enter = () => {

        if ((validate_email() || validate_phone_number()) && validate_passsword()) {

            request({
                action: "sign_in",
                phone_number: +document.querySelector('#phone_number').value,
                email: document.querySelector('#email').value,
                password: document.querySelector('#password').value
            })
                .then(data => {

                    try {
                        init(data);
                    } catch (e) {
                        enqueueSnackbar('Неправильный логин или пароль',
                            {variant: 'error',
                                autoHideDuration: 1000
                            });
                    }

                });

        }

    };

    const registration = () => {

        if (authControl.isValid('#user_name') && (validate_email() || validate_phone_number()) && validate_passsword()) {

            request({
                action: "confirmation_code_request",
                phone_number: +document.querySelector('#phone_number').value,
                email: document.querySelector('#email').value,
            })
                .then(data => {
                    if (data.result) {

                        setStatus(data.org_id
                            ? 'register_invitation_confirm'
                            : 'register_confirm')

                        setRegPassword(document.querySelector('#password').value)
                        setOrgId(data.org_id)
                        setOrgName(data.org_name)

                    } else {

                        if (data.error === 'already_used') {

                            enqueueSnackbar('Такой пользователь уже существует, восстановите пароль',
                                {variant: 'warning'}
                            )
                            setStatus('restore')

                        } else if (data.error === 'wrong_format') {

                            enqueueSnackbar('Неправильный формат',
                                {variant: 'warning'}
                            )
                            document.querySelector('#phone_number').classList.remove('valid')
                            document.querySelector('#phone_number').classList.add('invalid')

                        }
                    }

                });
        }

    }

    const restore = () => {

        if (validate_email() || validate_phone_number()) {

            request({
                action: "password_restore_request",
                email: document.querySelector('#email').value,
                phone_number: +document.querySelector('#phone_number').value
            })
                .then(data => {
                    if (data.result) {
                        setStatus('restore_confirm')
                    } else {
                        if (data.error === 'not_user') {

                            document.querySelector('#phone_number').classList.remove('valid')
                            document.querySelector('#phone_number').classList.add('invalid')
                            enqueueSnackbar('Пользователь не существует',
                                {variant: 'error'}
                            );
                        }
                    }

                });

        }

    };

    const register_confirm = (isInvitation = false) => {

        if (authControl.isValid('#confirmation_code') && authControl.isValid('#user_name') && (validate_email() || validate_phone_number()) && validate_passsword()) {

            request({
                action: "registration",
                user_name: document.querySelector('#user_name').value,
                email: document.querySelector('#email').value,
                phone_number: +document.querySelector('#phone_number').value,
                password: regPassword,
                confirmation_code: document.querySelector('#confirmation_code').value,
                org_id: org_id,
                isInvitation
            })
                .then(data => {

                    try {
                        if (init(data)) setStatus('login');
                    } catch (e) {

                        enqueueSnackbar('Ошибка регистрации',
                            {variant: 'warning'}
                        )

                    }

                });

        }

    };

    const restore_confirm = () => {

        if (validate_passsword() && authControl.isValid('#confirmation_code')) {


            request({
                action: "password_change",
                email: document.querySelector('#email').value,
                phone_number: +document.querySelector('#phone_number').value,
                password: document.querySelector('#password').value,
                confirmation_code: document.querySelector('#confirmation_code').value,
            })
                .then(data => {
                    try {
                        if (init(data)) setStatus('login');
                    } catch (e) {
                        // console.log(e, data);
                        enqueueSnackbar('Ошибка',
                            {variant: 'warning'}
                        )
                    }

                })
        }

    };

    const password_div = id => {
        if (status === 'restore' || status === 'register_confirm') return;
        if (id !== 'password' && status === 'login') return;
        let label = 'Пароль';
        if (status === 'restore_confirm') label = 'Новый пароль';
        if (id === 'password2') label = 'Подтверждение пароля';
        return authControl.renderPasswordDiv('div_' + id, id, validate_passsword, label);
    }

    const enter_btn = () => <MDBBtn className="btn-sm" onClick={enter}>
        Войти
    </MDBBtn>

    const registration_btn = () => <MDBBtn className="btn-sm" color="primary" onClick={registration}>
        Зарегистрироваться
    </MDBBtn>

    const restore_btn = () => <MDBBtn className="btn-sm" color="warning" onClick={restore}>
        Восстановить
    </MDBBtn>

    const register_confirm_btn = (isInvitation = true) => isInvitation
        ? <MDBBtn className="btn-sm" onClick={register_confirm}>
            Подтвердить
        </MDBBtn>
        : <MDBBtn className="btn-sm" onClick={register_confirm}>
            Нет, зарегистрировать новую организацию
        </MDBBtn>

    const register_invitation_confirm_btn = () => <MDBBtn className="btn-sm"
                                                          color="primary"
                                                          onClick={() => register_confirm(true)}>
        Да, я сотрудник
    </MDBBtn>

    const restore_confirm_btn = () => <MDBBtn className="btn-sm"
                                              onClick={restore_confirm}>
        Подтвердить
    </MDBBtn>

    const enter_tab_btn = () => <MDBBtn outline className="btn-sm" color="danger"
                                        onClick={() => setStatus('login')}>
        Отмена
    </MDBBtn>

    const registretion_tab_btn = () => <MDBBtn outline className="btn-sm" color="primary"
                                               onClick={() => setStatus('register')}>
        Регистриция
    </MDBBtn>

    const restore_tab_btn = () => <MDBBtn outline className="btn-sm"
                                          color="warning"
                                          onClick={() => setStatus('restore')}>
        Забыли пароль?
    </MDBBtn>

    const buttons = () => { // eslint-disable-next-line
        switch (status) {

            case "login":
                return <div className="modal-footer d-flex justify-content-center">
                    {enter_btn()}
                    {registretion_tab_btn()}
                    {restore_tab_btn()}
                </div>

            case "register":
                return <div className="modal-footer d-flex justify-content-center">
                    {enter_tab_btn()}
                    {registration_btn()}
                </div>

            case "restore":
                return <div className="modal-footer d-flex justify-content-center">
                    {enter_tab_btn()}
                    {restore_btn()}
                </div>

            case "register_confirm":
                return <div className="modal-footer d-flex justify-content-center">
                    {enter_tab_btn()}
                    {register_confirm_btn()}
                </div>

            case "register_invitation_confirm":
                return <div>
                    <div className="modal-footer d-flex justify-content-center">
                        Вы были добавленны в Uchet.Store, как сотрудник "
                        {orgName}", хотите присоединиться с этой организации?
                    </div>
                    <div className="modal-footer d-flex justify-content-center">
                        {register_invitation_confirm_btn()}
                        {register_confirm_btn(false)}
                    </div>
                    <div className="modal-footer d-flex justify-content-center">
                        {enter_tab_btn()}
                    </div>
                </div>

            case "restore_confirm":
                return <div className="modal-footer d-flex justify-content-center">
                    {enter_tab_btn()}
                    {restore_confirm_btn()}
                </div>

        }
    }

    let isConfirm = status.substr(-7) === 'confirm';

    return <div onKeyPress={keyPress}>
        <MDBModal id="authModal" isOpen={+props.auth.user_id < 1} toggle={keyPress}>

            <div className="modal-header text-center">
                <MDBRow>
                    <MDBCol className="flex-center">
                        <img src="https://uchet.store/src/images/uchet.gif" className="imgdiv" width="120"
                             alt="Uchet.store"/>
                    </MDBCol>
                </MDBRow>
            </div>

            <div className="modal-body mx-3">

                {status.substr(0, 8) === 'register' ?
                    authControl.renderUserNameDiv('user_name', isConfirm) :
                    ''}
                {authControl.renderEmailDiv('div_email', 'email', validate_email, isConfirm)}
                {authControl.renderPhoneNumberDiv('div_phone_number', 'phone_number', validate_phone_number, isConfirm)}
                {password_div('password')}
                {password_div('password2')}
                {isConfirm ?
                    authControl.renderConfirmationCodeDiv('confirmation_code', 'Код подтверждения') :
                    ''}

            </div>

            {buttons()}

        </MDBModal>
    </div>

});