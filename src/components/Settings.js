import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

import {MDBBtn} from "mdbreact";

import AuthControl from './AuthControl';
import request from "./Request";
import {closeSnackbar, enqueueSnackbar} from "../actions/actionCreator";

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
  }

  validateWait = () => {
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

  render() {

    return <div className="container-fluid m-4">

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

    </div>;

  }

});
