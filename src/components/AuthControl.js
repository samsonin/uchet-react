import $ from "jquery";
import React from "react";

export default class {

    focus(e) {
        let div = $(e.target).closest('div');
        div.find('label').addClass('active');
        div.find('input').focus();
    }

    blur(e) {
        if ($(e.target).val() === '') $(e.target).removeClass('invalid valid').closest('div').find('label').removeClass('active');
    }

    getElement(any) {
        return typeof any === 'string' ?
            any.substr(0, 1) === '#' ?
                $(any) : $('#' + any)
            : $(any.target);
    }

    isValid = (input_id) => {

        let input = this.getElement(input_id);

        let result = input.val() === '';
        result ?
            input.removeClass('valid').addClass('invalid'):
            input.removeClass('invalid').addClass('valid');
        return !result;

    };

    validate_email_phone_number(current_input_selector, other_div_selector) {

        $(current_input_selector).val() === "" ?
            $(other_div_selector).show() :
            $(other_div_selector).hide();

    }

    validate_email = (id_selector_elem) => {

        let email = this.getElement(id_selector_elem);

        let r = /^\w+@\w+\.\w{2,5}$/i;
        let result = r.test(email.val());
        result ?
            email.removeClass('invalid').addClass('valid') :
            email.removeClass('valid').addClass('invalid');
        return result;

    };

    validate_phone_number = (id_selector_elem) => {

        let phone_number = this.getElement(id_selector_elem);
        let number = +phone_number.val();

        if (isNaN(number) || number < 999999 || number > 99999999999999) {
            phone_number.removeClass('valid').addClass('invalid');
            return false;
        } else {
            phone_number.removeClass('invalid').addClass('valid');
            return true;
        }

    }

    validate_passwords(password_1_id, password_2_id, isNeedCheckAll) {

        if (isNeedCheckAll) {
            if (this.isValid(password_1_id) && this.isValid(password_2_id)) {
                let password = $('#' + password_1_id);
                let password2 = $('#' + password_2_id);
                if (password.val() !== password2.val()) {
                    password.removeClass('valid').addClass('invalid');
                    password2.removeClass('valid').addClass('invalid');
                    return false;
                } else {
                    password.removeClass('invalid').addClass('valid');
                    password2.removeClass('invalid').addClass('valid');
                    return true;
                }
            }
        } else {
            return this.isValid(password_1_id)
        }
        return false;

    }

    renderUserNameDiv(input_id, isReadonly) {
        return (
            <div className="md-form mb-5" onInput={this.focus} onClick={this.focus}>
                <i className="fas fa-user prefix grey-text"/>
                <input type="text" id={input_id} onBlur={this.blur}
                       onChange={this.isValid}
                       className="form-control validate" readOnly={isReadonly}/>
                <label className="">
                    Имя
                </label>
            </div>
        )
    }

    renderEmailDiv(div_id, input_id, onChange, isReadonly) {
        return (
            <div id={div_id} className="md-form mb-5" onInput={this.focus} onClick={this.focus}>
                <i className="fas fa-envelope prefix grey-text"/>
                <input type="text" id={input_id} onBlur={this.blur}
                       onChange={onChange}
                       className="form-control validate" readOnly={isReadonly}/>
                <label className="">
                    Email
                </label>
            </div>
        )
    }

    renderPhoneNumberDiv(div_id, input_id, onChange, isReadonly = false) {
        return <div id={div_id} className="md-form mb-5" onInput={this.focus} onClick={this.focus}>
            <i className="fas fa-phone prefix grey-text"/>
            <input type="text" id={input_id} onBlur={this.blur}
                   onChange={onChange} className="form-control validate" readOnly={isReadonly}/>
            <label className="">
                Номер телефона
            </label>
        </div>
    }

    renderPasswordDiv(div_id, input_id, onChange, label, isReadOnly = false) {
        return (
            <div id={'div_' + div_id} className="md-form mb-5" onInput={this.focus} onClick={this.focus}>
                <i className="fas fa-lock prefix grey-text"/>
                <input type="password" id={input_id} onBlur={this.blur} onChange={e => onChange}
                       className="form-control validate" readOnly={isReadOnly}/>
                <label>
                    {label}
                </label>
            </div>
        )
    }

    renderConfirmationCodeDiv(input_id, label) {
        return (
            <div className="md-form mb-5" onInput={this.focus} onClick={this.focus}>
                <i className="fas fa-check-circle prefix grey-text"/>
                <input type="text" id={input_id} onBlur={this.blur} onChange={this.isValid}
                       className="form-control validate"/>
                <label className="">{label}</label>
            </div>

        )
    }

}
